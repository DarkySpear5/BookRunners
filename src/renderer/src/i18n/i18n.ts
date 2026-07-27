import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from '../locales/en/common.json'
import enGenres from '../locales/en/genres.json'

// Only English is bundled eagerly (needed synchronously as both the initial
// lng and the fallbackLng) — the other 9 languages are fetched on demand via
// loadLanguage() below (see settingsStore.ts), instead of every renderer
// bundle carrying all 10 languages' JSON whether or not they're ever used.
void i18n.use(initReactI18next).init({
  resources: { en: { common: enCommon, genres: enGenres } },
  lng: 'en',
  fallbackLng: 'en', // mirrors v1's lang -> en -> raw key fallback chain
  defaultNS: 'common',
  ns: ['common', 'genres'],
  interpolation: { escapeValue: false }, // React already escapes; i18next's own escaping would double-escape
  returnNull: false
})

/** No-ops once `lang` is already loaded (English is pre-loaded above). */
export async function loadLanguage(lang: string): Promise<void> {
  if (i18n.hasResourceBundle(lang, 'common')) return
  const [common, genres] = await Promise.all([
    import(`../locales/${lang}/common.json`),
    import(`../locales/${lang}/genres.json`)
  ])
  i18n.addResourceBundle(lang, 'common', common.default)
  i18n.addResourceBundle(lang, 'genres', genres.default)
}

export default i18n
