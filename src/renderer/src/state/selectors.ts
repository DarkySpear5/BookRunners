import type { Profile, SortMode, Status } from '@shared/types'

/** Mirrors v1's _sort_profile_items / genre+status filtering exactly. */
export function sortAndFilterProfiles(
  profiles: Record<string, Profile>,
  sortMode: SortMode,
  genreFilter: string,
  statusFilter: 'All' | Status
): Profile[] {
  let list = Object.values(profiles)

  if (genreFilter !== 'All') {
    list = list.filter((p) => p.genres.includes(genreFilter))
  }
  if (statusFilter !== 'All') {
    list = list.filter((p) => p.status === statusFilter)
  }

  const byName = (a: Profile, b: Profile): number => a.name.localeCompare(b.name)

  switch (sortMode) {
    case 'author':
      list.sort((a, b) => a.author.localeCompare(b.author) || byName(a, b))
      break
    case 'last_read':
      list.sort((a, b) => (b.lastRead ?? 0) - (a.lastRead ?? 0) || byName(a, b))
      break
    case 'rating':
      list.sort((a, b) => b.rating - a.rating || byName(a, b))
      break
    case 'genre':
      list.sort((a, b) => a.genres.join(', ').localeCompare(b.genres.join(', ')) || byName(a, b))
      break
    case 'name':
    default:
      list.sort(byName)
  }

  return list
}

/** Live seconds for display: committed `seconds` plus whatever the running timer's ticked since the last checkpoint. */
export function displaySeconds(profile: Profile, running: Record<string, number>): number {
  return running[profile.name] ?? profile.seconds
}
