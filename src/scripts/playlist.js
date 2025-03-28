import { supabase } from './supabase-client.js'

console.log('Playlist.js loaded')

// Get playlist ID from URL path
const pathParts = window.location.pathname.split('/')
const playlistId = pathParts[pathParts.length - 1]
console.log('Playlist ID:', playlistId)

// Show loading state
document.getElementById('playlist').innerHTML = '<div class="loading">Loading playlist...</div>'

if (!playlistId) {
    console.error('No playlist ID provided')
    document.getElementById('playlist').innerHTML = '<div class="error">No playlist ID provided</div>'
} else {
    loadPlaylist(playlistId)
}

async function loadPlaylist(playlistId) {
    try {
        console.log('Loading playlist:', playlistId)
        // Load playlist data
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('*')
            .eq('id', playlistId)
            .single()

        if (playlistError) {
            console.error('Playlist error:', playlistError)
            throw playlistError
        }
        if (!playlist) {
            console.error('Playlist not found')
            throw new Error('Playlist not found')
        }

        console.log('Playlist loaded:', playlist)

        // Update expiry info
        const expiryDate = new Date(playlist.expires_at)
        const expiryInfo = document.getElementById('expiry-info')
        expiryInfo.textContent = `Expires: ${expiryDate.toLocaleString()}`

        // Load songs
        const { data: songs, error: songsError } = await supabase
            .from('songs')
            .select('*')
            .eq('playlist_id', playlistId)
            .order('upvotes', { ascending: false })

        if (songsError) {
            console.error('Songs error:', songsError)
            throw songsError
        }

        console.log('Songs loaded:', songs)

        // Display songs
        const playlistElement = document.getElementById('playlist')
        playlistElement.innerHTML = '' // Clear existing songs
        songs.forEach((song, index) => {
            const songElement = createSongElement(song, index)
            playlistElement.appendChild(songElement)
        })

    } catch (error) {
        console.error('Error loading playlist:', error)
        document.getElementById('playlist').innerHTML = `<div class="error">Error loading playlist: ${error.message}</div>`
    }
}

function createSongElement(song, index) {
    const div = document.createElement('div')
    div.className = 'song-item'
    div.innerHTML = `
        <div class="song-info">
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
        </div>
        <div class="song-votes">
            <button onclick="handleUpvote('${song.id}')" class="vote-btn upvote-btn" aria-label="Upvote">
                <span class="vote-icon">👍</span>
                <span class="vote-count">${song.upvotes || 0}</span>
            </button>
            <button onclick="handleDownvote('${song.id}')" class="vote-btn downvote-btn" aria-label="Downvote">
                <span class="vote-icon">👎</span>
                <span class="vote-count">${song.downvotes || 0}</span>
            </button>
        </div>
    `
    return div
}

// Make voting functions available globally
window.handleUpvote = async function(songId) {
    try {
        const voteButton = document.querySelector(`button[onclick="handleUpvote('${songId}')"]`)
        if (voteButton) {
            voteButton.disabled = true
        }
        
        const { error } = await supabase.rpc('upvote_song', { song_id: songId })
        if (error) throw error
        
        await loadPlaylist(playlistId)
    } catch (error) {
        console.error('Error upvoting song:', error)
        alert('Failed to upvote song. Please try again.')
    } finally {
        if (voteButton) {
            voteButton.disabled = false
        }
    }
}

window.handleDownvote = async function(songId) {
    try {
        const voteButton = document.querySelector(`button[onclick="handleDownvote('${songId}')"]`)
        if (voteButton) {
            voteButton.disabled = true
        }
        
        const { error } = await supabase.rpc('downvote_song', { song_id: songId })
        if (error) throw error
        
        await loadPlaylist(playlistId)
    } catch (error) {
        console.error('Error downvoting song:', error)
        alert('Failed to downvote song. Please try again.')
    } finally {
        if (voteButton) {
            voteButton.disabled = false
        }
    }
} 