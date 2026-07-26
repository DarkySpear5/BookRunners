import type { BookRunnersApi } from '@shared/ipcContract'

declare global {
  interface Window {
    api: BookRunnersApi
  }
}
