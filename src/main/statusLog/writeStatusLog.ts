import { promises as fs } from 'fs'
import { paths } from '../store/paths'
import { dataStore } from '../store/dataStore'
import { formatSeconds } from '@shared/format'
import { timestampString } from '../util/date'
import type { Status } from '@shared/types'

const STATUS_LABELS: Partial<Record<Status, string>> = {
  finished: 'Finished',
  dropped: 'Dropped',
  on_hold: 'On Hold'
}

/**
 * Fully overwrites a human-readable snapshot (bookrunners_log.txt) — not an
 * append-only log, despite the filename. Mirrors v1's write_log_file()
 * exactly, including its "never crash the app" contract.
 */
export async function writeStatusLog(): Promise<void> {
  try {
    const data = dataStore.get()
    const entries = Object.entries(data.profiles)
    const totalSeconds = entries.reduce((sum, [, p]) => sum + p.seconds, 0)
    const finishedCount = entries.filter(([, p]) => p.status === 'finished').length

    const lines: string[] = []
    lines.push('BOOK RUNNERS — LOG')
    lines.push(`Last updated: ${timestampString()}`)
    lines.push('')
    lines.push('SUMMARY')
    lines.push(`  Total time reading : ${formatSeconds(totalSeconds)}`)
    lines.push(`  Books on shelf     : ${entries.length}`)
    lines.push(`  Books finished     : ${finishedCount}`)
    lines.push('')
    lines.push('BOOKS')

    const nameWidth = Math.max(...entries.map(([n]) => n.length), 10) + 2
    for (const [name, info] of entries) {
      const statusLabel = STATUS_LABELS[info.status] ?? 'Reading'
      let finishedOn = ''
      if (info.statusAt) {
        const stamp = info.statusSeconds != null ? `, at ${formatSeconds(info.statusSeconds)}` : ''
        finishedOn = ` (${info.statusAt}${stamp})`
      }
      const author = info.author ? ` by ${info.author}` : ''
      const stars = '★'.repeat(info.rating) + '☆'.repeat(5 - info.rating)
      const genre = info.genres.join(', ')
      lines.push(
        `  ${name.padEnd(nameWidth)}${author.padEnd(24)} ${formatSeconds(info.seconds).padStart(14)}  ` +
          `${statusLabel}${finishedOn}  ${stars}  [${genre}]`
      )
    }

    await fs.writeFile(paths.logFile(), lines.join('\n') + '\n', 'utf-8')
  } catch {
    // logging must never crash the app
  }
}
