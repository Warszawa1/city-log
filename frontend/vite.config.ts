import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.0.121:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {  // Removed unused parameter
          proxy.on('error', (err) => {  // Removed unused parameters
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_, req) => {  // Used underscore for unused parameter
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {  // Removed unused parameter
            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },

  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'RatLogger',
        short_name: 'RatLogger',
        description: 'Track and report rat sightings',
        theme_color: '#1E293B',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        background_color: '#1E293B',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait'
      }
    })
  ]
})
