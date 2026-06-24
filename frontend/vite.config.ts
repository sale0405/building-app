import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    ...(process.env.SKIP_PWA === '1'
      ? []
      : [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'background.png'],
            manifest: {
              name: 'IT PARK OSIJEK',
              short_name: 'IT PARK',
              description: 'PWA za stanare IT Parka Osijek',
              theme_color: '#1e40af',
              background_color: '#ffffff',
              display: 'standalone',
              start_url: '/',
              icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
            },
            workbox: {
              navigateFallbackDenylist: [/^\/api\//],
              globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            },
          }),
        ]),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
