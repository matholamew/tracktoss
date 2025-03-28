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

// Function to find an available port
async function findAvailablePort(startPort) {
    const net = await import('net')
    return new Promise((resolve, reject) => {
        const server = net.createServer()
        
        server.listen(startPort, () => {
            const { port } = server.address()
            server.close(() => resolve(port))
        })
        
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(findAvailablePort(startPort + 1))
            } else {
                reject(err)
            }
        })
    })
}

// Start server with port finding
findAvailablePort(PORT).then(port => {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server running on port ${port}`)
        console.log(`Serving files from: ${path.join(__dirname, 'dist')}`)
        console.log('Available files:', fs.readdirSync(path.join(__dirname, 'dist')))
        console.log(`Access the playlist at: http://localhost:${port}/playlist/123e4567-e89b-12d3-a456-426614174000`)
    })
}).catch(err => {
    console.error('Failed to start server:', err)
    process.exit(1)
}) 