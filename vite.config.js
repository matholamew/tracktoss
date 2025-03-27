import { defineConfig } from 'vite'
import { resolve } from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  server: {
    historyApiFallback: true,
    proxy: {
      '/playlist': {
        target: '/',
        rewrite: (path) => '/src/playlist/playlist.html'
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        playlist: resolve(__dirname, 'src/playlist/playlist.html')
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
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