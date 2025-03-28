import { execSync } from 'child_process'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Run Vite build
console.log('Running Vite build...')
execSync('vite build', { stdio: 'inherit' })

// Move HTML files to root
console.log('Moving HTML files to root...')
const distDir = 'dist'
const pagesDir = join(distDir, 'src', 'pages')

// Create dist directory if it doesn't exist
if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true })
}

// Move playlist.html
const playlistSrc = join(pagesDir, 'playlist.html')
const playlistDest = join(distDir, 'playlist.html')
if (existsSync(playlistSrc)) {
    copyFileSync(playlistSrc, playlistDest)
    console.log('Moved playlist.html to root')
}

// Move playlists.html
const playlistsSrc = join(pagesDir, 'playlists.html')
const playlistsDest = join(distDir, 'playlists.html')
if (existsSync(playlistsSrc)) {
    copyFileSync(playlistsSrc, playlistsDest)
    console.log('Moved playlists.html to root')
}

console.log('Build complete!') 