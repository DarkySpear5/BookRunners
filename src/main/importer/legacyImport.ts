import { promises as fs, existsSync } from 'fs'
import { dirname, join, extname } from 'path'
import { randomUUID } from 'crypto'
import { dataStore } from '../store/dataStore'
import { paths } from '../store/paths'
import { locateLegacyDataFile } from './legacyLocate'
import { readFirstRunState, writeFirstRunState } from './firstRun'
import { setRunAtStartup } from '../autostart/autostart'
import { saveCappedImage } from '../util/imageResize'
import {
  DEFAULT_CUSTOM_COLORS,
  THEME_ORDER,
  THEMES,
  COVER_MAX_DIMENSION,
  BACKGROUND_MAX_DIMENSION
} from '@shared/constants'
import type { LegacyDetectResult, Profile, Settings } from '@shared/types'

/**
 * v1's on-disk shape is snake_case, and — unlike GameTimer's v1, which had
 * already grown a 4-state status/statusAt/statusSeconds triplet by the time
 * it was rewritten — BookRunners v1 only ever reached a plain boolean
 * `completed`/`completed_at` pair. There's no On Hold/Dropped concept and no
 * "time at completion" snapshot to carry over; those are new in v2 (see
 * README/CHANGELOG). Every field is optional here and unknown keys are
 * simply never read, rather than assuming the file is canonical.
 */
interface LegacyProfileRaw {
  seconds?: number
  icon_file?: string | null
  bg_color?: string | null
  bg_image?: string | null
  completed?: boolean
  completed_at?: string | null
  genres?: string[]
  genre?: string
  last_played?: number | null
  author?: string
  notes?: string
  rating?: number
}

interface LegacyDataRaw {
  profiles?: Record<string, LegacyProfileRaw>
  last_selected?: string | null
  settings?: Record<string, unknown>
}

function normalizeLegacyProfile(name: string, raw: LegacyProfileRaw): Profile {
  const finished = !!raw.completed
  const genres =
    Array.isArray(raw.genres) && raw.genres.length ? raw.genres : raw.genre ? [raw.genre] : ['Uncategorized']

  const rating = ([0, 1, 2, 3, 4, 5] as number[]).includes(raw.rating ?? 0)
    ? ((raw.rating ?? 0) as 0 | 1 | 2 | 3 | 4 | 5)
    : 0

  return {
    name,
    author: raw.author ?? '',
    seconds: typeof raw.seconds === 'number' ? raw.seconds : 0,
    iconFile: raw.icon_file ?? null,
    bgColor: raw.bg_color ?? null,
    bgImage: raw.bg_image ?? null,
    status: finished ? 'finished' : 'reading',
    statusAt: finished ? (raw.completed_at ?? null) : null,
    // v1 never recorded "time read at completion" — best-effort snapshot is
    // the current cumulative total at import time, matching what the app
    // would already show for a finished book with no prior snapshot.
    statusSeconds: finished ? (typeof raw.seconds === 'number' ? raw.seconds : 0) : null,
    genres,
    lastRead: raw.last_played ?? null,
    startedDate: null,
    notes: raw.notes ?? '',
    rating
  }
}

const LEGACY_SORT_MODE: Record<string, Settings['sortMode']> = {
  name: 'name',
  author: 'author',
  last_played: 'last_read',
  rating: 'rating',
  genre: 'genre'
}

function normalizeLegacySettings(raw: Record<string, unknown> | undefined): Settings {
  const themeName = THEME_ORDER.includes(raw?.theme as never)
    ? (raw!.theme as Settings['theme'])
    : 'Cozy Cottage'

  // v1 kept an independent accent-color override on top of whichever theme
  // was active (settings.accent) — v2 folds accent into Customize Colors
  // only (the same simplification GameTimer made). To not change anyone's
  // look on upgrade, if their accent override differs from the theme's own
  // default accent, migrate them onto Custom with that accent baked in.
  const base = themeName === 'Custom' ? DEFAULT_CUSTOM_COLORS : THEMES[themeName]
  const legacyAccent = raw?.accent as string | undefined
  const customColorsRaw = raw?.custom_colors as Settings['customColors'] | undefined
  let theme = themeName
  let customColors = customColorsRaw ?? DEFAULT_CUSTOM_COLORS
  if (themeName !== 'Custom' && legacyAccent && legacyAccent !== base.accent) {
    theme = 'Custom'
    customColors = { ...base, accent: legacyAccent }
  }

  return {
    trayEnabled: (raw?.tray_enabled as boolean) ?? true,
    runAtStartup: (raw?.run_at_startup as boolean) ?? false,
    checkForUpdates: true, // v1 has no equivalent concept — default on for a fresh v2 setting
    coverSize: (raw?.icon_size as number) ?? 36,
    theme,
    customColors,
    fontFamily: (raw?.font_family as string) ?? 'Georgia',
    fontScale: 1.0,
    sortMode: LEGACY_SORT_MODE[raw?.sort_mode as string] ?? 'name',
    genreFilter: (raw?.genre_filter as string) ?? 'All',
    statusFilter: 'All',
    language: (raw?.language as string) ?? 'en'
  }
}

/** Copies an asset in (capped to maxDimension), renaming on collision as defense-in-depth (uuid-based v1 filenames make collisions vanishingly unlikely). */
async function copyAssetIfExists(
  sourcePath: string,
  destDir: string,
  preferredFileName: string,
  maxDimension: number
): Promise<string | null> {
  if (!existsSync(sourcePath)) return null
  await fs.mkdir(destDir, { recursive: true })
  let fileName = preferredFileName
  if (existsSync(join(destDir, fileName))) {
    fileName = `${randomUUID()}${extname(preferredFileName)}`
  }
  await saveCappedImage(sourcePath, join(destDir, fileName), maxDimension)
  return fileName
}

async function readLegacyData(dataFilePath: string): Promise<LegacyDataRaw> {
  return JSON.parse(await fs.readFile(dataFilePath, 'utf-8'))
}

export async function detectLegacyLibrary(force: boolean): Promise<LegacyDetectResult> {
  if (!force) {
    const firstRun = await readFirstRunState()
    if (firstRun) return { found: false }
  }

  const path = await locateLegacyDataFile()
  if (!path) {
    if (!force) await writeFirstRunState({ legacyImportState: 'none-found' })
    return { found: false }
  }

  try {
    const raw = await readLegacyData(path)
    const profiles = Object.values(raw.profiles ?? {})
    const totalSeconds = profiles.reduce((sum, p) => sum + (p.seconds ?? 0), 0)
    return { found: true, path, profileCount: profiles.length, totalSeconds }
  } catch {
    return { found: false }
  }
}

export async function skipLegacyImport(): Promise<void> {
  await writeFirstRunState({ legacyImportState: 'skipped' })
}

export async function runLegacyImport(legacyDataFilePath: string): Promise<{ importedCount: number }> {
  const legacyDir = dirname(legacyDataFilePath)
  const raw = await readLegacyData(legacyDataFilePath)
  const legacyProfiles = raw.profiles ?? {}

  const data = dataStore.get()
  let importedCount = 0

  for (const [name, rawProfile] of Object.entries(legacyProfiles)) {
    const profile = normalizeLegacyProfile(name, rawProfile)

    if (profile.iconFile) {
      profile.iconFile = await copyAssetIfExists(
        join(legacyDir, 'covers', profile.iconFile),
        paths.coversDir(),
        profile.iconFile,
        COVER_MAX_DIMENSION
      )
    }
    if (profile.bgImage) {
      profile.bgImage = await copyAssetIfExists(
        join(legacyDir, 'backgrounds', profile.bgImage),
        paths.backgroundsDir(),
        profile.bgImage,
        BACKGROUND_MAX_DIMENSION
      )
    }

    // Defense-in-depth: v2 normally starts empty, so this shouldn't collide, but never overwrite.
    let finalName = name
    let counter = 2
    while (finalName in data.profiles) {
      finalName = `${name} (${counter})`
      counter++
    }
    profile.name = finalName
    data.profiles[finalName] = profile
    importedCount++
  }

  data.settings = normalizeLegacySettings(raw.settings)
  if (raw.last_selected && data.profiles[raw.last_selected]) {
    data.lastSelected = raw.last_selected
  }
  // Applies to v2's own exe path — Electron's setLoginItemSettings only ever
  // touches this app's own registration, never v1's, so carrying the
  // preference over is safe rather than silently dropping it to false.
  setRunAtStartup(data.settings.runAtStartup)

  await dataStore.save()
  await writeFirstRunState({ legacyImportState: 'imported', importedFromPath: legacyDataFilePath })
  return { importedCount }
}
