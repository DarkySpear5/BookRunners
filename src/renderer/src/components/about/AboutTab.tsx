import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const GITHUB_URL = 'https://github.com/DarkySpear5/BookRunners'

// Each entry renders as its own line, joined by `sep` when it has more than
// one item — lets "React + TypeScript" link each half separately while
// keeping the original " + " between them. Deliberately no color/underline
// at rest (only `hover:text-text`) so these don't visually compete with the
// one link meant to stand out (GitHub, below).
const BUILT_WITH: { sep: string; items: { label: string; url: string }[] }[] = [
  { sep: '', items: [{ label: 'Electron', url: 'https://www.electronjs.org/' }] },
  {
    sep: ' + ',
    items: [
      { label: 'React', url: 'https://react.dev/' },
      { label: 'TypeScript', url: 'https://www.typescriptlang.org/' }
    ]
  },
  { sep: '', items: [{ label: 'Tailwind CSS', url: 'https://tailwindcss.com/' }] },
  { sep: '', items: [{ label: 'Zustand', url: 'https://github.com/pmndrs/zustand' }] },
  {
    sep: ' / ',
    items: [
      { label: 'electron-vite', url: 'https://electron-vite.org/' },
      { label: 'electron-builder', url: 'https://www.electron.build/' }
    ]
  }
]

export function AboutTab(): React.JSX.Element {
  const { t } = useTranslation()
  const [version, setVersion] = useState('2.0.0')

  useEffect(() => {
    void window.api.app.getVersion().then(setVersion)
  }, [])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 text-sm text-text">
      <div className="mb-1 text-xl font-semibold">Capharnaum</div>
      <div className="mb-5 text-subtext">{t('about_tagline', { version })}</div>
      <div className="mb-2 font-semibold">{t('about_built_with')}</div>
      <ul className="list-disc space-y-1 pl-5 text-subtext">
        {BUILT_WITH.map((line, i) => (
          <li key={i}>
            {line.items.map((item, j) => (
              <span key={item.label}>
                {j > 0 && line.sep}
                <a href={item.url} target="_blank" rel="noreferrer" className="hover:text-text">
                  {item.label}
                </a>
              </span>
            ))}
          </li>
        ))}
      </ul>
      <div className="mt-5 mb-2 font-semibold">{t('about_contact_header')}</div>
      <div className="flex flex-col gap-1.5">
        <div>
          <span className="text-subtext">{t('about_contact_discord_label')}: </span>
          rawwwwwrr
        </div>
        <div>
          <span className="text-subtext">{t('about_contact_github_label')}: </span>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-accent hover:underline">
            {GITHUB_URL}
          </a>
        </div>
      </div>
    </div>
  )
}
