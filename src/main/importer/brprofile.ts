import { promises as fs, existsSync } from 'fs'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'
import { BrowserWindow, dialog } from 'electron'
import { dataStore } from '../store/dataStore'
import { paths } from '../store/paths'
import { timerEngine } from '../timer/timerEngine'
import { writeStatusLog } from '../statusLog/writeStatusLog'
import { saveCappedImageBuffer } from '../util/imageResize'
import { COVER_MAX_DIMENSION, BACKGROUND_MAX_DIMENSION } from '@shared/constants'
import type { BrProfileFile, Profile } from '@shared/types'

/** Single-book export, self-contained (images embedded as base64) — wire-compatible with v1's .brprofile format. */
export async function exportProfile(win: BrowserWindow, name: string): Promise<{ path: string } | null> {
  timerEngine.checkpointOne(name) // reflect the live session, not a stale value
  const profile = dataStore.get().profiles[name]
  if (!profile) throw new Error(`No such profile: ${name}`)

  const exported: BrProfileFile = {
    name: profile.name,
    author: profile.author,
    seconds: profile.seconds,
    status: profile.status,
    statusAt: profile.statusAt,
    statusSeconds: profile.statusSeconds,
    genres: profile.genres,
    lastRead: profile.lastRead,
    startedDate: profile.startedDate,
    notes: profile.notes,
    rating: profile.rating
  }

  if (profile.iconFile) {
    const iconPath = join(paths.coversDir(), profile.iconFile)
    if (existsSync(iconPath)) {
      exported.iconB64 = (await fs.readFile(iconPath)).toString('base64')
      exported.iconExt = extname(profile.iconFile)
    }
  }
  if (profile.bgImage) {
    const bgPath = join(paths.backgroundsDir(), profile.bgImage)
    if (existsSync(bgPath)) {
      exported.bgImageB64 = (await fs.readFile(bgPath)).toString('base64')
      exported.bgImageExt = extname(profile.bgImage)
    }
  } else if (profile.bgColor) {
    exported.bgColor = profile.bgColor
  }

  await fs.mkdir(paths.profilesDir(), { recursive: true })
  const result = await dialog.showSaveDialog(win, {
    defaultPath: join(paths.profilesDir(), `${profile.name}.brprofile`),
    filters: [{ name: 'Capharnaum Profile', extensions: ['brprofile'] }]
  })
  if (result.canceled || !result.filePath) return null

  await fs.writeFile(result.filePath, JSON.stringify(exported), 'utf-8')
  return { path: result.filePath }
}

/** Always creates a new, uniquely-named profile — never overwrites/merges an existing one. */
export async function importProfile(win: BrowserWindow): Promise<Profile | null> {
  await fs.mkdir(paths.profilesDir(), { recursive: true })
  const result = await dialog.showOpenDialog(win, {
    defaultPath: paths.profilesDir(),
    filters: [
      { name: 'Capharnaum Profile', extensions: ['brprofile'] },
      { name: 'All files', extensions: ['*'] }
    ],
    properties: ['openFile']
  })
  if (result.canceled || !result.filePaths[0]) return null

  const imported: BrProfileFile = JSON.parse(await fs.readFile(result.filePaths[0], 'utf-8'))
  const data = dataStore.get()

  let name = imported.name || 'Imported Book'
  const originalName = name
  let counter = 2
  while (name in data.profiles) {
    name = `${originalName} (${counter})`
    counter++
  }

  let iconFile: string | null = null
  if (imported.iconB64) {
    try {
      await fs.mkdir(paths.coversDir(), { recursive: true })
      iconFile = `${randomUUID()}${imported.iconExt || '.png'}`
      await saveCappedImageBuffer(
        Buffer.from(imported.iconB64, 'base64'),
        join(paths.coversDir(), iconFile),
        COVER_MAX_DIMENSION
      )
    } catch {
      iconFile = null
    }
  }

  let bgImageFile: string | null = null
  if (imported.bgImageB64) {
    try {
      await fs.mkdir(paths.backgroundsDir(), { recursive: true })
      bgImageFile = `${randomUUID()}${imported.bgImageExt || '.png'}`
      await saveCappedImageBuffer(
        Buffer.from(imported.bgImageB64, 'base64'),
        join(paths.backgroundsDir(), bgImageFile),
        BACKGROUND_MAX_DIMENSION
      )
    } catch {
      bgImageFile = null
    }
  }

  const profile: Profile = {
    name,
    author: imported.author ?? '',
    seconds: imported.seconds ?? 0,
    iconFile,
    bgColor: bgImageFile ? null : (imported.bgColor ?? null),
    bgImage: bgImageFile,
    status: imported.status ?? 'reading',
    statusAt: imported.statusAt ?? null,
    statusSeconds: imported.statusSeconds ?? null,
    genres: imported.genres?.length ? imported.genres : ['Uncategorized'],
    lastRead: imported.lastRead ?? null,
    startedDate: imported.startedDate ?? null,
    notes: imported.notes ?? '',
    rating: (imported.rating ?? 0) as Profile['rating']
  }

  data.profiles[name] = profile
  await dataStore.safeSave()
  void writeStatusLog()
  return profile
}
