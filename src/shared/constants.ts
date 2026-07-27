import type { ThemeColors, ThemeName } from './types'

// Each preset defines the whole palette — cozy/neutral/warm reading-nook
// tones, ported verbatim from v1's Tkinter app. GREEN/RED/GOLD stay constant
// across themes since they're functional (reading/paused/finished), not
// decorative.
export const THEMES: Record<Exclude<ThemeName, 'Custom'>, ThemeColors> = {
  'Cozy Cottage': {
    bg: '#f4e9dc',
    panel: '#e8d9c5',
    card: '#fbf3e7',
    text: '#4a3428',
    subtext: '#8a6f5c',
    accent: '#c97b5f'
  },
  'Blush Library': {
    bg: '#fbeaf0',
    panel: '#f6d9e4',
    card: '#fff5f8',
    text: '#5c3444',
    subtext: '#a5748a',
    accent: '#e17ea3'
  },
  'Sage & Linen': {
    bg: '#eef0e6',
    panel: '#dde2d2',
    card: '#f7f8f2',
    text: '#3f4a3a',
    subtext: '#788a6f',
    accent: '#7c9473'
  },
  'Lavender Dusk': {
    bg: '#f1ecf7',
    panel: '#e3d9ef',
    card: '#faf7fc',
    text: '#453255',
    subtext: '#8877a0',
    accent: '#9b7ec4'
  },
  'Warm Oak': {
    bg: '#3a2a1e',
    panel: '#2c2015',
    card: '#4a3626',
    text: '#f0e0c8',
    subtext: '#c2a685',
    accent: '#d9a441'
  },
  'Midnight Library': {
    bg: '#1c2230',
    panel: '#161b26',
    card: '#262e40',
    text: '#e4e8f2',
    subtext: '#94a0b8',
    accent: '#6f9ceb'
  },
  'Autumn Pages': {
    bg: '#f2e2d5',
    panel: '#e8cfb8',
    card: '#faf1e7',
    text: '#3d2418',
    subtext: '#8c6a52',
    accent: '#b8461f'
  },
  'Mint Marginalia': {
    bg: '#e5f2ee',
    panel: '#d1e6df',
    card: '#f5faf8',
    text: '#1f3d35',
    subtext: '#5c8579',
    accent: '#2f9b7d'
  },
  'Slate Study': {
    bg: '#e7eaef',
    panel: '#d5dae2',
    card: '#f7f9fb',
    text: '#29303b',
    subtext: '#66707e',
    accent: '#4a6fa5'
  }
}

export const THEME_ORDER: ThemeName[] = [
  'Cozy Cottage',
  'Blush Library',
  'Sage & Linen',
  'Lavender Dusk',
  'Warm Oak',
  'Midnight Library',
  'Autumn Pages',
  'Mint Marginalia',
  'Slate Study',
  'Custom'
]

export const DEFAULT_CUSTOM_COLORS: ThemeColors = { ...THEMES['Cozy Cottage'] }

// Functional colors — never themeable (reading/paused/finished state).
export const GREEN = '#8fae7a'
export const RED = '#d98a7a'
export const GOLD = '#e0b354'

// Curated, cottage-appropriate quick picks. The Settings font picker merges
// this list with every font installed on the user's PC (see fonts:list IPC)
// into one combined dropdown, deduped — this is just the seed/fallback set
// shown before the installed-fonts list finishes loading.
export const FONT_CHOICES = [
  'Georgia',
  'Segoe UI',
  'Verdana',
  'Arial',
  'Calibri',
  'Trebuchet MS',
  'Comic Sans MS'
]

export const FONT_SCALE_MIN = 1.0
export const FONT_SCALE_MAX = 1.5

// Caps applied whenever a cover/background is newly uploaded or imported —
// generous relative to real on-screen size (covers never render above 72px,
// see COVER_SIZE_OPTIONS below) so there's no visible quality loss, but a
// 4000x3000 phone photo no longer gets decoded/stored at full resolution for
// a 36px thumbnail. See src/main/util/imageResize.ts.
export const COVER_MAX_DIMENSION = 256
export const BACKGROUND_MAX_DIMENSION = 2560

export const COVER_SIZE_OPTIONS: Record<string, number> = {
  Small: 24,
  Medium: 36,
  Large: 52,
  'Extra Large': 72
}

export const GENRE_OPTIONS = [
  'Uncategorized',
  'Fiction',
  'Non-Fiction',
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Thriller',
  'Romance',
  'Horror',
  'Historical Fiction',
  'Biography / Memoir',
  'Self-Help',
  'Young Adult',
  "Children's",
  'Poetry',
  'Classics',
  'Graphic Novel / Manga',
  'Adventure',
  'Crime',
  'Dystopian',
  'Contemporary',
  'Other'
] as const

export type GenreKey = (typeof GENRE_OPTIONS)[number]

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  ru: 'Русский',
  ja: '日本語',
  ko: '한국어',
  it: 'Italiano',
  de: 'Deutsch',
  pt: 'Português (Brasil)',
  zh: '中文 (简体)'
}

export const LANGUAGE_ORDER = ['en', 'fr', 'es', 'ru', 'ja', 'ko', 'it', 'de', 'pt', 'zh']

// Timer engine cadence — mirrors v1's _tick() intervals exactly.
export const UI_TICK_MS = 500
export const CHECKPOINT_MS = 5000
export const STATUS_LOG_MS = 60000
export const BACKUP_RETENTION_DAYS = 14
