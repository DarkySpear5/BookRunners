import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useProfilesStore } from '../../state/profilesStore'
import { useTimerStore } from '../../state/timerStore'
import { useUiStore } from '../../state/uiStore'
import { formatSeconds } from '@shared/format'
import type { Status } from '@shared/types'

// Same accent-tint wash as the global surfaces (tailwind.css's .bg-panel/.bg-card
// rule), duplicated here in JS because this element's background is set via
// inline style (profile-specific image/color), which wins the cascade over an
// external stylesheet rule — without this, a custom background would look
// untinted next to every other themed surface in the app.
const ACCENT_WASH =
  'linear-gradient(color-mix(in srgb, var(--br-accent) 8%, transparent), color-mix(in srgb, var(--br-accent) 8%, transparent))'

export function SelectedBookView(): React.JSX.Element {
  const { t } = useTranslation()
  const selected = useUiStore((s) => s.selected)
  const profile = useProfilesStore((s) => (selected ? s.profiles[selected] : null))
  const running = useTimerStore((s) => s.running)

  const STATUS_LABEL: Record<Status, string> = {
    reading: t('status_paused'),
    finished: t('status_finished'),
    dropped: t('status_dropped'),
    on_hold: t('status_on_hold')
  }

  if (!profile) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-subtext">{t('canvas_no_book_selected')}</div>
      </div>
    )
  }

  const isRunning = profile.name in running
  const seconds = running[profile.name] ?? profile.seconds

  async function togglePlay(): Promise<void> {
    if (isRunning) await window.api.timer.pause(profile!.name)
    else await window.api.timer.start(profile!.name)
    useProfilesStore.getState().setAll(await window.api.profiles.list())
  }

  async function toggleFinished(): Promise<void> {
    const nextStatus: Status = profile!.status === 'finished' ? 'reading' : 'finished'
    useProfilesStore.getState().upsert(await window.api.profiles.setStatus(profile!.name, nextStatus))
  }

  const backgroundStyle: CSSProperties = profile.bgImage
    ? {
        backgroundImage: `${ACCENT_WASH}, url(br-asset://backgrounds/${encodeURIComponent(profile.bgImage)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'color'
      }
    : profile.bgColor
      ? { backgroundColor: profile.bgColor, backgroundImage: ACCENT_WASH, backgroundBlendMode: 'color' }
      : { backgroundImage: ACCENT_WASH, backgroundBlendMode: 'color' }

  const hasCustomBackground = !!(profile.bgImage || profile.bgColor)

  return (
    <div
      className="relative flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden"
      style={backgroundStyle}
    >
      <div
        className={`relative z-10 flex flex-col items-center gap-3 ${hasCustomBackground ? 'rounded-2xl px-12 py-9' : ''}`}
        style={hasCustomBackground ? { backgroundColor: 'rgba(30, 22, 15, 0.55)' } : undefined}
      >
        <div className="text-2xl font-semibold text-text">{profile.name}</div>
        {profile.author && <div className="text-sm text-subtext">{t('canvas_by_author', { author: profile.author })}</div>}
        <div className={isRunning ? 'text-sm text-green' : 'text-sm text-subtext'}>
          {isRunning ? t('status_reading_now') : STATUS_LABEL[profile.status]}
        </div>
        {profile.rating > 0 && (
          <div className="text-base text-gold">
            {'★'.repeat(profile.rating)}
            {'☆'.repeat(5 - profile.rating)}
          </div>
        )}
        <div className="font-mono text-5xl font-bold tabular-nums text-text">{formatSeconds(seconds)}</div>
        <div className="mt-2 flex gap-3">
          <button
            onClick={() => void togglePlay()}
            className={`rounded-lg px-6 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90 ${
              isRunning ? 'bg-red' : 'bg-green'
            }`}
          >
            {isRunning ? t('btn_pause') : t('btn_read')}
          </button>
          <button
            onClick={() => void toggleFinished()}
            className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 ${
              profile.status === 'finished' ? 'bg-accent text-bg' : 'bg-gold text-bg'
            }`}
          >
            {t('btn_finished')}
          </button>
        </div>
      </div>
    </div>
  )
}
