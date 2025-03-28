import { supabase } from './supabase-client.js'
import { musicService } from './music-services.js'

// DOM Elements
const startPlaylistBtn = document.getElementById('startPlaylistBtn')
const contributePlaylistBtn = document.getElementById('contributePlaylistBtn')
const qrCodeModal = document.getElementById('qrCodeModal')
const closeModalBtn = document.getElementById('closeModalBtn')
const qrCodeImage = document.getElementById('qrCodeImage')
const scannerContainer = document.getElementById('scannerContainer')
const videoElement = document.getElementById('scannerVideo')
const closeScannerBtn = document.getElementById('closeScannerBtn')
const searchModal = document.getElementById('searchModal')
const closeSearchModalBtn = document.getElementById('closeSearchModalBtn')
const searchInput = document.getElementById('searchInput')
const searchResults = document.getElementById('searchResults')
const searchLoading = document.getElementById('searchLoading')
const noResults = document.getElementById('noResults')

// Event Listeners
startPlaylistBtn.addEventListener('click', handleStartPlaylist)
contributePlaylistBtn.addEventListener('click', handleStartScanner)
closeModalBtn.addEventListener('click', handleCloseModal)
closeScannerBtn.addEventListener('click', handleCloseScanner)
closeSearchModalBtn.addEventListener('click', handleCloseSearchModal)
searchInput.addEventListener('input', debounce(handleSearch, 300))

// Auth Event Listeners
document.getElementById('spotifyLoginBtn').addEventListener('click', () => musicService.authenticateSpotify())
document.getElementById('youtubeLoginBtn').addEventListener('click', () => musicService.authenticateYouTube())

// Check for auth callbacks
window.addEventListener('load', () => {
  const hash = window.location.hash
  if (hash) {
    if (window.location.pathname.includes('/auth/spotify')) {
      if (musicService.handleSpotifyCallback(hash)) {
        window.location.hash = ''
        updateAuthUI()
      }
    } else if (window.location.pathname.includes('/auth/youtube')) {
      if (musicService.handleYouTubeCallback(hash)) {
        window.location.hash = ''
        updateAuthUI()
      }
    }
  }
})

// Update UI based on auth status
function updateAuthUI() {
  const spotifyBtn = document.getElementById('spotifyLoginBtn')
  const youtubeBtn = document.getElementById('youtubeLoginBtn')

  if (musicService.isSpotifyAuthenticated()) {
    spotifyBtn.innerHTML = `
      <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
      Connected to Spotify
    `
    spotifyBtn.classList.add('bg-[#1DB954]')
    spotifyBtn.classList.remove('bg-gray-400')
  } else {
    spotifyBtn.innerHTML = `
      <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
      Connect Spotify
    `
    spotifyBtn.classList.remove('bg-[#1DB954]')
    spotifyBtn.classList.add('bg-gray-400')
  }

  if (musicService.isYouTubeAuthenticated()) {
    youtubeBtn.innerHTML = `
      <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
      Connected to YouTube
    `
    youtubeBtn.classList.add('bg-[#FF0000]')
    youtubeBtn.classList.remove('bg-gray-400')
  } else {
    youtubeBtn.innerHTML = `
      <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
      Connect YouTube
    `
    youtubeBtn.classList.remove('bg-[#FF0000]')
    youtubeBtn.classList.add('bg-gray-400')
  }
}

// Initialize auth UI
updateAuthUI()

let scanner = null
let scannerStream = null
let currentPlaylistId = null

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

function handleCloseModal() {
  qrCodeModal.classList.add('hidden')
}

function handleCloseSearchModal() {
  searchModal.classList.add('hidden')
  searchInput.value = ''
  searchResults.innerHTML = ''
  searchLoading.classList.add('hidden')
  noResults.classList.add('hidden')
}

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

// Make handleSongSelect available globally
window.handleSongSelect = async function(songId, title, artist, service) {
  try {
    const { data: song, error } = await supabase
      .from('songs')
      .insert([
        {
          playlist_id: currentPlaylistId,
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
    handleCloseSearchModal()
    
    // Show success message
    alert('Song added to playlist!')
  } catch (error) {
    console.error('Error adding song:', error)
    alert('Failed to add song. Please try again.')
  }
}

function handleCloseScanner() {
  if (scanner) {
    scanner.stop();
    scanner = null;
  }
  if (scannerStream) {
    scannerStream.getTracks().forEach(track => track.stop());
    scannerStream = null;
  }
  scannerContainer.classList.add('hidden');
}

async function handlePlaylistJoin(playlistId) {
  try {
    // Validate playlist ID
    if (!playlistId) {
      throw new Error('Invalid playlist ID')
    }

    // Store the playlist ID
    currentPlaylistId = playlistId

    // Load the playlist
    await loadPlaylist(playlistId)
  } catch (error) {
    console.error('Error joining playlist:', error)
    showError('Failed to join playlist')
  }
}

async function handleSharePlaylist(playlistId) {
  const shareUrl = `${window.location.origin}/playlist/${playlistId}`
  
  try {
    // Check if Web Share API is available
    if (navigator.share) {
      // Use Web Share API
      await navigator.share({
        title: 'Join my TrackToss playlist!',
        text: 'Scan this QR code to join my playlist and add your favorite songs.',
        url: shareUrl
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      // Try to copy to clipboard first
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('Playlist link copied to clipboard!')
      } catch (clipboardError) {
        // If clipboard fails, show the URL to copy manually
        alert(`Please copy this link to share: ${shareUrl}`)
      }
    }
  } catch (error) {
    // Ignore AbortError as it's expected when user cancels the share dialog
    if (error.name !== 'AbortError') {
      console.error('Error sharing:', error)
      alert('Failed to share playlist. Please try again.')
    }
  }
}

async function handleStartPlaylist() {
  try {
    // Show loading state
    const startButton = document.getElementById('startPlaylistBtn')
    if (startButton) {
      startButton.disabled = true
      startButton.innerHTML = '<span class="animate-spin">⌛</span> Creating playlist...'
    }

    // Create new playlist
    const { data: playlist, error } = await supabase
      .from('playlists')
      .insert([
        {
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          active: true
        }
      ])
      .select()
      .single()

    if (error) throw error

    currentPlaylistId = playlist.id

    // Generate QR code
    const qrCodeUrl = `${window.location.origin}/playlist/${playlist.id}`
    console.log('Generating QR code for URL:', qrCodeUrl)
    
    // Clear any existing QR code
    const qrCodeImage = document.getElementById('qrCodeImage')
    if (qrCodeImage) {
      qrCodeImage.src = ''
    }

    // Generate new QR code using qrcode-generator
    const qr = qrcode(0, 'M')
    qr.addData(qrCodeUrl)
    qr.make()
    const qrCodeDataUrl = qr.createDataURL(4, 0)
    
    // Display QR code in modal
    if (qrCodeImage) {
      qrCodeImage.src = qrCodeDataUrl
      qrCodeImage.onload = () => console.log('QR code image loaded')
    }

    // Show the modal
    const qrCodeModal = document.getElementById('qrCodeModal')
    if (qrCodeModal) {
      qrCodeModal.classList.remove('hidden')
    }

    // Add event listeners to the buttons
    const startSearchBtn = document.getElementById('startSearchBtn')
    const sharePlaylistBtn = document.getElementById('sharePlaylistBtn')

    if (startSearchBtn) {
      startSearchBtn.addEventListener('click', () => {
        qrCodeModal.classList.add('hidden')
        searchModal.classList.remove('hidden')
      })
    }

    if (sharePlaylistBtn) {
      sharePlaylistBtn.addEventListener('click', () => {
        handleSharePlaylist(playlist.id)
      })
    }

  } catch (error) {
    console.error('Error creating playlist:', error)
    alert(error.message || 'Failed to create playlist. Please try again.')
  } finally {
    // Reset button state
    const startButton = document.getElementById('startPlaylistBtn')
    if (startButton) {
      startButton.disabled = false
      startButton.innerHTML = 'Create Playlist'
    }
  }
}

// Add these functions after the handleAddSong function
async function handleUpvote(songId) {
    try {
        const { error } = await supabase.rpc('upvote_song', { song_id: songId });
        if (error) throw error;
        
        // Refresh the playlist to show updated votes
        await loadPlaylist(currentPlaylistId);
    } catch (error) {
        console.error('Error upvoting song:', error);
        showError('Failed to upvote song');
    }
}

async function handleDownvote(songId) {
    try {
        const { error } = await supabase.rpc('downvote_song', { song_id: songId });
        if (error) throw error;
        
        // Refresh the playlist to show updated votes
        await loadPlaylist(currentPlaylistId);
    } catch (error) {
        console.error('Error downvoting song:', error);
        showError('Failed to downvote song');
    }
}

// Update the loadPlaylist function to include voting buttons
async function loadPlaylist(playlistId) {
    try {
        // Load the playlist data
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('*')
            .eq('id', playlistId)
            .single();

        if (playlistError) throw playlistError;

        // Update UI to show playlist view
        document.getElementById('scannerContainer').classList.add('hidden');
        document.getElementById('playlistContainer').classList.remove('hidden');
        document.getElementById('player').classList.remove('hidden');

        // Load songs into the player
        await player.loadPlaylist(playlistId);

        // Load songs into the playlist view
        const { data: songs, error: songsError } = await supabase
            .from('songs')
            .select('*')
            .eq('playlist_id', playlistId)
            .order('upvotes', { ascending: false });

        if (songsError) throw songsError;

        const playlistContainer = document.getElementById('playlistContainer');
        playlistContainer.innerHTML = '';

        songs.forEach(song => {
            const songElement = document.createElement('div');
            songElement.className = 'flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow mb-4';
            songElement.innerHTML = `
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${song.title}</h3>
                    <p class="text-gray-600 dark:text-gray-300">${song.artist}</p>
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
            `;
            playlistContainer.appendChild(songElement);
        });
    } catch (error) {
        console.error('Error loading playlist:', error);
        showError('Failed to load playlist');
    }
}

function generateQRCode(playlistId) {
    const playlistUrl = `${window.location.origin}/playlist/${playlistId}`;
    const qrCode = document.getElementById('qrCode');
    qrCode.innerHTML = ''; // Clear existing QR code
    new QRCode(qrCode, {
        text: playlistUrl,
        width: 256,
        height: 256,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Make functions available globally
window.handleStartScanner = handleStartScanner
window.handleCloseScanner = handleCloseScanner
window.handleCloseModal = handleCloseModal
window.handleCloseSearchModal = handleCloseSearchModal
window.handleStartPlaylist = handleStartPlaylist
window.handleSharePlaylist = handleSharePlaylist
window.handleUpvote = handleUpvote
window.handleDownvote = handleDownvote

async function handleStartScanner() {
  try {
    // Create new scanner instance
    scanner = new Instascan.Scanner({
      video: videoElement,
      scanPeriod: 5,
      mirror: false
    });

    // Add scan listener
    scanner.addListener('scan', function(content) {
      console.log('QR Code detected:', content);
      // Stop scanning
      handleCloseScanner();
      
      // Extract playlist ID from URL
      const playlistId = content.split('/').pop();
      handlePlaylistJoin(playlistId);
    });

    // Request camera access
    scannerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    
    // Set the video source
    videoElement.srcObject = scannerStream;
    
    // Start scanning
    await scanner.start();
    scannerContainer.classList.remove('hidden');
  } catch (error) {
    console.error('Error starting scanner:', error);
    if (error.name === 'NotAllowedError') {
      alert('Camera access was denied. Please allow camera access in your browser settings.');
    } else if (error.name === 'NotFoundError') {
      alert('No camera found. Please make sure your device has a camera.');
    } else {
      alert('Unable to start camera. Please try again or refresh the page.');
    }
  }
} 