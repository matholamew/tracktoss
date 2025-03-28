import { supabase } from './supabase.js'

async function fetchPlaylists() {
    try {
        const { data, error } = await supabase
            .from('playlists')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error fetching playlists:', error)
        return []
    }
}

function createPlaylistCard(playlist) {
    const card = document.createElement('div')
    card.className = 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200'
    
    const createdAt = new Date(playlist.created_at).toLocaleDateString()
    
    card.innerHTML = `
        <h2 class="text-xl font-semibold text-gray-900 mb-2">${playlist.name || 'Unnamed Playlist'}</h2>
        <p class="text-gray-600 mb-4">Created on ${createdAt}</p>
        <a href="/playlist/${playlist.id}" 
           class="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
            View Playlist
        </a>
    `
    
    return card
}

async function initializePlaylists() {
    const container = document.getElementById('playlists-container')
    if (!container) return

    const playlists = await fetchPlaylists()
    
    if (playlists.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-600">No active playlists found.</p>
            </div>
        `
        return
    }

    playlists.forEach(playlist => {
        const card = createPlaylistCard(playlist)
        container.appendChild(card)
    })
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializePlaylists) 