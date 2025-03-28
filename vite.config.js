import { defineConfig } from 'vite'
import { resolve } from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    historyApiFallback: {
      rewrites: [
        { from: /^\/playlist\/.*/, to: '/src/playlist/playlist.html' }
      ]
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
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
      '@': '/src',
    },
  },
  optimizeDeps: {
    exclude: ['@supabase/supabase-js']
  },
  publicDir: 'public',
  base: '/'
}) 