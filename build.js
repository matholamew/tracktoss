import { execSync } from 'child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'

// Run Vite build
console.log('Running Vite build...')
execSync('vite build', { stdio: 'inherit' })

// Move HTML files to root
console.log('Moving HTML files to root...')
const distDir = 'dist'

// Create dist directory if it doesn't exist
if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true })
}

// Copy playlist.html from src/pages to root
const playlistSrc = join(distDir, 'src', 'pages', 'playlist.html')
const playlistDest = join(distDir, 'playlist.html')
if (existsSync(playlistSrc)) {
    const content = readFileSync(playlistSrc, 'utf-8')
    // Ensure the bundled assets are correctly referenced and preserve global event handlers
    const updatedContent = content
        .replace(/src="\/src\/scripts\//g, 'src="/assets/')
        .replace(/href="\/src\/styles\//g, 'href="/assets/')
        .replace(/<\/body>/, `
    <!-- Make functions available globally -->
    <script>
        window.handleSongSelect = (songId, title, artist, service) => {
            window.dispatchEvent(new CustomEvent('handleSongSelect', { 
                detail: { songId, title, artist, service } 
            }))
        }
        window.handleUpvote = (songId) => {
            window.dispatchEvent(new CustomEvent('handleUpvote', { 
                detail: { songId } 
            }))
        }
        window.handleDownvote = (songId) => {
            window.dispatchEvent(new CustomEvent('handleDownvote', { 
                detail: { songId } 
            }))
        }
    </script>
</body>`)
    writeFileSync(playlistDest, updatedContent)
    console.log('Copied and updated playlist.html to root')
} else {
    console.error('playlist.html not found in src/pages')
}

// Copy playlists.html from src/pages to root
const playlistsSrc = join(distDir, 'src', 'pages', 'playlists.html')
const playlistsDest = join(distDir, 'playlists.html')
if (existsSync(playlistsSrc)) {
    const content = readFileSync(playlistsSrc, 'utf-8')
    // Ensure the bundled assets are correctly referenced
    const updatedContent = content
        .replace(/src="\/src\/scripts\//g, 'src="/assets/')
        .replace(/href="\/src\/styles\//g, 'href="/assets/')
    writeFileSync(playlistsDest, updatedContent)
    console.log('Copied and updated playlists.html to root')
} else {
    console.error('playlists.html not found in src/pages')
}

// Create playlist directory
const playlistDir = join(distDir, 'playlist')
if (!existsSync(playlistDir)) {
    mkdirSync(playlistDir, { recursive: true })
}

// Create individual HTML files for known playlists
const knownPlaylists = [
    { id: 'd34f6992-a142-4a9f-943d-9acdb5df2c64', name: 'My First Playlist' },
    { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Another Playlist' }
]

console.log('Creating individual playlist HTML files...')
for (const playlist of knownPlaylists) {
    const playlistHtmlPath = join(playlistDir, `${playlist.id}.html`)
    const playlistContent = readFileSync(playlistDest, 'utf-8')
        .replace('TrackToss - Playlist', `TrackToss - ${playlist.name}`)
        .replace('Playlist', playlist.name)
    
    writeFileSync(playlistHtmlPath, playlistContent)
    console.log(`Created playlist HTML for ${playlist.name} (${playlist.id})`)
}

// Clean up src/pages directory
try {
    rmSync(join(distDir, 'src', 'pages'), { recursive: true, force: true })
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