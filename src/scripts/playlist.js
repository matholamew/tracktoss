import { supabase } from './supabase-client.js'
import { musicService } from './music-services.js'

console.log('Playlist.js loaded')

// Get playlist ID from URL
const pathParts = window.location.pathname.split('/')
const playlistId = pathParts[pathParts.length - 1]
console.log('Playlist ID:', playlistId)

// DOM Elements
const songsList = document.getElementById('songsList')
const loadingState = document.getElementById('loadingState')
const emptyState = document.getElementById('emptyState')
const addSongBtn = document.getElementById('addSongBtn')
const searchModal = document.getElementById('searchModal')
const closeSearchModalBtn = document.getElementById('closeSearchModalBtn')
const searchInput = document.getElementById('searchInput')
const searchResults = document.getElementById('searchResults')
const searchLoading = document.getElementById('searchLoading')
const noResults = document.getElementById('noResults')

// Event Listeners
addSongBtn.addEventListener('click', () => {
    searchModal.classList.remove('hidden')
})

closeSearchModalBtn.addEventListener('click', () => {
    searchModal.classList.add('hidden')
    searchInput.value = ''
    searchResults.innerHTML = ''
    searchLoading.classList.add('hidden')
    noResults.classList.add('hidden')
})

searchInput.addEventListener('input', debounce(handleSearch, 300))

// Debounce function for search input
function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Show loading state
document.getElementById('playlist').innerHTML = '<div class="loading">Loading playlist...</div>'

// Initialize playlist
if (!playlistId) {
    console.error('No playlist ID provided')
    showError('No playlist ID provided')
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

        // Update page title
        document.title = `${playlist.name} - TrackToss`
        
        // Load songs
        await loadSongs()

    } catch (error) {
        console.error('Error loading playlist:', error)
        showError('Error loading playlist: ' + error.message)
    }
}

// Load songs from playlist
async function loadSongs() {
    try {
        loadingState.classList.remove('hidden')
        emptyState.classList.add('hidden')
        songsList.innerHTML = ''

        const { data: songs, error } = await supabase
            .from('songs')
            .select('*')
            .eq('playlist_id', playlistId)
            .order('upvotes', { ascending: false })

        if (error) throw error

        if (!songs || songs.length === 0) {
            emptyState.classList.remove('hidden')
            return
        }

        songs.forEach((song, index) => {
            const songElement = createSongElement(song, index + 1)
            songsList.appendChild(songElement)
        })
    } catch (error) {
        console.error('Error loading songs:', error)
        showError('Failed to load songs')
    } finally {
        loadingState.classList.add('hidden')
    }
}

// Create song element
function createSongElement(song, rank) {
    const div = document.createElement('div')
    div.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4'
    div.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span class="text-primary font-semibold">${rank}</span>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${song.title}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${song.artist}</p>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <div class="text-center">
                    <div class="text-xl font-bold text-gray-900 dark:text-white">${song.upvotes - song.downvotes}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">votes</div>
                </div>
                <div class="flex flex-col space-y-2">
                    <button onclick="handleUpvote('${song.id}')" class="p-2 text-green-600 hover:text-green-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                        </svg>
                    </button>
                    <button onclick="handleDownvote('${song.id}')" class="p-2 text-red-600 hover:text-red-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `
    return div
}

// Handle song search
async function handleSearch() {
    const query = searchInput.value.trim()
    if (!query) {
        searchResults.innerHTML = ''
        searchLoading.classList.remove('hidden')
        noResults.classList.add('hidden')
        return
    }

    searchLoading.classList.remove('hidden')
    noResults.classList.add('hidden')
    searchResults.innerHTML = ''

    try {
        const results = await musicService.searchSongs(query)
        
        if (results.length === 0) {
            noResults.classList.remove('hidden')
            return
        }

        searchResults.innerHTML = results.map(song => `
            <div class="p-4 hover:bg-gray-50 cursor-pointer" onclick="handleSongSelect('${song.id}', '${song.title}', '${song.artist}', '${song.service}')">
                <div class="flex items-center space-x-4">
                    <img src="${song.thumbnail}" alt="${song.title}" class="w-12 h-12 rounded-lg object-cover">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-2">
                            <h3 class="text-sm font-medium text-gray-900 truncate">${song.title}</h3>
                            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                song.service === 'spotify' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }">
                                ${song.service === 'spotify' ? 'Spotify' : 'YouTube'}
                            </span>
                        </div>
                        <p class="text-sm text-gray-500 truncate">${song.artist}</p>
                    </div>
                    <div class="flex-shrink-0">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        `).join('')
    } catch (error) {
        console.error('Search error:', error)
        noResults.classList.remove('hidden')
    } finally {
        searchLoading.classList.add('hidden')
    }
}

// Handle song selection
window.handleSongSelect = async function(songId, title, artist, service) {
    try {
        const { data: song, error } = await supabase
            .from('songs')
            .insert([
                {
                    playlist_id: playlistId,
                    title,
                    artist,
                    service,
                    external_id: songId,
                    upvotes: 0,
                    downvotes: 0
                }
            ])
            .select()
            .single()

        if (error) throw error

        // Close search modal
        searchModal.classList.add('hidden')
        searchInput.value = ''
        
        // Reload songs list
        await loadSongs()
    } catch (error) {
        console.error('Error adding song:', error)
        showError('Failed to add song')
    }
}

// Handle upvote
window.handleUpvote = async function(songId) {
    try {
        const { error } = await supabase.rpc('upvote_song', { song_id: songId })
        if (error) throw error
        
        // Reload songs to update order
        await loadSongs()
    } catch (error) {
        console.error('Error upvoting song:', error)
        showError('Failed to upvote song')
    }
}

// Handle downvote
window.handleDownvote = async function(songId) {
    try {
        const { error } = await supabase.rpc('downvote_song', { song_id: songId })
        if (error) throw error
        
        // Reload songs to update order
        await loadSongs()
    } catch (error) {
        console.error('Error downvoting song:', error)
        showError('Failed to downvote song')
    }
}

// Show error message
function showError(message) {
    alert(message)
}

// Initialize playlist
loadSongs()

// Subscribe to real-time updates
supabase
    .channel('playlist_changes')
    .on(
        'postgres_changes',
        {
            event: '*',
            schema: 'public',
            table: 'songs',
            filter: `playlist_id=eq.${playlistId}`
        },
        () => {
            loadSongs()
        }
    )
    .subscribe() 