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
        main: resolve(__dirname, 'index.html'),
      },
      external: ['@supabase/supabase-js']
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
  optimizeDeps: {
    exclude: ['@supabase/supabase-js']
  },
  publicDir: 'public',
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      external: ['@supabase/supabase-js']
    }
  }
}) 