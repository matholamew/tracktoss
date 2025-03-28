import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Serve static files from the dist directory
app.use(express.static('dist'))

// Handle playlist routes
app.get('/playlist/:id', (req, res) => {
    // Validate playlist ID format (UUID)
    const playlistId = req.params.id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(playlistId)) {
        return res.status(400).send('Invalid playlist ID format')
    }
    
    // Check if playlist exists in database
    res.sendFile(path.join(__dirname, 'dist', 'playlist.html'))
})

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
}) 