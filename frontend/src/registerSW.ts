import { registerSW } from 'virtual:pwa-register'

export function registerPWA() {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm('New content available. Reload?')) {
          updateSW()
        }
      },
      onOfflineReady() {
        console.log('App ready to work offline')
      },
    })
  }
}