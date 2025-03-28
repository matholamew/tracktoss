import { execSync } from 'child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'

// Run Vite build
console.log('Running Vite build...')
execSync('vite build', { stdio: 'inherit' })

// Verify files exist in root
console.log('Verifying files...')
const files = ['playlist.html', 'playlists.html', 'index.html']
files.forEach(file => {
    const path = join('dist', file)
    if (existsSync(path)) {
        console.log(`✓ ${file} exists in root`)
    } else {
        console.error(`✗ ${file} not found in root`)
    }
})

console.log('Build complete!') 