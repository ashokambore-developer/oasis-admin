import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_API_URL || 'http://localhost:8000'

  return {
    base: './',
    build: {
      outDir: 'build',
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.ico', 'oasis-icon.png'],
        manifest: {
          name: 'Oasis Admin',
          short_name: 'Oasis Admin',
          description: 'Oasis Travel Platform Admin Panel',
          theme_color: '#321fdb',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: 'oasis-icon.png', sizes: 'any', type: 'image/png' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api\//, /^\/trpc\//],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            { urlPattern: /\/api\//, handler: 'NetworkOnly' },
            { urlPattern: /\/trpc\//, handler: 'NetworkOnly' },
          ],
        },
      }),
    ],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/trpc': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/socket.io': {
          target: backendUrl,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})
