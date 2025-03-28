import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

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
    
    // Send the playlist page
    res.sendFile(path.join(__dirname, 'dist', 'playlist.html'), (err) => {
        if (err) {
            console.error('Error sending playlist.html:', err)
            res.status(404).send('Playlist page not found')
        }
    })
})

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
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
}) 