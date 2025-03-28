import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')))

// Handle playlist routes
app.get('/playlist/:id', (req, res) => {
    // Validate playlist ID format (UUID)
    const playlistId = req.params.id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(playlistId)) {
        return res.status(400).send('Invalid playlist ID format')
    }
    
    // Check if playlist.html exists
    const playlistPath = path.join(__dirname, 'dist', 'playlist.html')
    if (!fs.existsSync(playlistPath)) {
        console.error('playlist.html not found at:', playlistPath)
        return res.status(404).send('Playlist page not found')
    }
    
    // Send the playlist page
    res.sendFile(playlistPath, (err) => {
        if (err) {
            console.error('Error sending playlist.html:', err)
            res.status(404).send('Playlist page not found')
        }
    })
})

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html')
    if (!fs.existsSync(indexPath)) {
        console.error('index.html not found at:', indexPath)
        return res.status(404).send('Page not found')
    }
    
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error sending index.html:', err)
            res.status(404).send('Page not found')
        }
    })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Serving files from: ${path.join(__dirname, 'dist')}`)
    console.log('Available files:', fs.readdirSync(path.join(__dirname, 'dist')))
}) 