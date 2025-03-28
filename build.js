import { execSync } from 'child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs'
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
    const content = readFileSync(playlistSrc, 'utf-8')
    writeFileSync(playlistDest, content)
    console.log('Moved playlist.html to root')
} else {
    console.error('playlist.html not found in src/pages')
}

// Move playlists.html
const playlistsSrc = join(pagesDir, 'playlists.html')
const playlistsDest = join(distDir, 'playlists.html')
if (existsSync(playlistsSrc)) {
    const content = readFileSync(playlistsSrc, 'utf-8')
    writeFileSync(playlistsDest, content)
    console.log('Moved playlists.html to root')
} else {
    console.error('playlists.html not found in src/pages')
}

// Clean up src/pages directory
try {
    rmSync(pagesDir, { recursive: true, force: true })
    console.log('Cleaned up src/pages directory')
} catch (error) {
    console.error('Error cleaning up src/pages directory:', error)
}

// Verify files exist in root
console.log('Verifying files...')
const files = ['playlist.html', 'playlists.html', 'index.html']
files.forEach(file => {
    const path = join(distDir, file)
    if (existsSync(path)) {
        console.log(`✓ ${file} exists in root`)
    } else {
        console.error(`✗ ${file} not found in root`)
    }
})

console.log('Build complete!') 