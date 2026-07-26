import { app } from 'electron'
import { join } from 'path'

/**
 * Unlike v1 (which lived entirely next to its own exe, portable-style), v2
 * uses the OS-conventional per-user app data location — standard Electron
 * practice, and the reason a first-run legacy importer exists at all (see
 * main/importer/legacyImport.ts).
 */
function root(): string {
  return app.getPath('userData')
}

export const paths = {
  root,
  dataFile: () => join(root(), 'bookrunners_data.json'),
  dataFileTmp: () => join(root(), 'bookrunners_data.json.tmp'),
  logFile: () => join(root(), 'bookrunners_log.txt'),
  backupsDir: () => join(root(), 'backups'),
  coversDir: () => join(root(), 'covers'),
  backgroundsDir: () => join(root(), 'backgrounds'),
  profilesDir: () => join(root(), 'books'),
  firstRunFile: () => join(root(), 'firstrun.json')
}
