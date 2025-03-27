import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    historyApiFallback: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        playlist: resolve(__dirname, 'src/playlist/[id].html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@scripts': resolve(__dirname, 'public/scripts')
    }
  },
  publicDir: 'public',
  base: '/',
  optimizeDeps: {
    exclude: ['jsqr']
  }
}) 