import { defineConfig } from 'vite'
import { resolve } from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        playlist: resolve(__dirname, 'src/pages/playlist.html'),
        playlists: resolve(__dirname, 'src/pages/playlists.html')
      }
    },
    copyPublicDir: true,
    emptyOutDir: true,
    sourcemap: true,
    assetsInlineLimit: 4096
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
  base: '/',
  plugins: [
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(/<script type="module" src="(.*?)"><\/script>/g, (match, src) => {
          return `<script type="module" src="${src}"></script>`
        })
      }
    }
  ]
}) 