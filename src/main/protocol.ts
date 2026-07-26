import { net, protocol } from 'electron'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { paths } from './store/paths'

export const BR_ASSET_SCHEME = 'br-asset'

/** Must be called before app.whenReady(). */
export function registerAssetSchemeAsPrivileged(): void {
  protocol.registerSchemesAsPrivileged([
    { scheme: BR_ASSET_SCHEME, privileges: { secure: true, supportFetchAPI: true } }
  ])
}

/**
 * Serves covers/backgrounds to the renderer as br-asset://covers/<file> and
 * br-asset://backgrounds/<file> — avoids piping image bytes through IPC as
 * base64 for every book's cover art on every list render.
 */
export function registerAssetProtocolHandler(): void {
  protocol.handle(BR_ASSET_SCHEME, (request) => {
    const url = new URL(request.url)
    const kind = url.hostname
    const fileName = decodeURIComponent(url.pathname.replace(/^\/+/, ''))
    const dir = kind === 'covers' ? paths.coversDir() : kind === 'backgrounds' ? paths.backgroundsDir() : null
    if (!dir || !fileName || fileName.includes('..')) {
      return new Response('Not found', { status: 404 })
    }
    return net.fetch(pathToFileURL(join(dir, fileName)).toString())
  })
}
