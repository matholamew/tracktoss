import { defineConfig } from 'vite'
import { resolve } from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    strictPort: true,
    historyApiFallback: {
      rewrites: [
        { from: /^\/playlist\/.*/, to: '/src/pages/playlist.html' }
      ]
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        playlist: resolve(__dirname, 'src/pages/playlist.html')
      },
      external: ['qrcode-generator', 'instascan']
    },
    copyPublicDir: true
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
      '@scripts': resolve(__dirname, 'src/scripts')
    }
  },
  publicDir: 'public',
  base: '/'
}) 