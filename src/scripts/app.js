import { supabase } from './supabase-client.js'
import { musicService } from './music-services.js'

// Global variables
let currentPlaylistId = null
let isSharing = false

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

let scanner = null
let scannerStream = null
let animationFrame = null

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
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
  if (scannerStream) {
    scannerStream.getTracks().forEach(track => track.stop())
    scannerStream = null
  }
  scannerContainer.classList.add('hidden')
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
  // Prevent multiple share attempts
  if (isSharing) {
    console.log('Share already in progress')
    return
  }

  const shareUrl = `${window.location.origin}/playlist/${playlistId}`
  
  try {
    isSharing = true
    
    // Check if Web Share API is available
    if (navigator.share) {
      // Get the QR code image data
      const qrCodeImage = document.getElementById('qrCodeImage')
      if (!qrCodeImage || !qrCodeImage.src) {
        throw new Error('QR code not found')
      }

      // Convert QR code data URL to Blob
      const response = await fetch(qrCodeImage.src)
      const blob = await response.blob()
      
      // Create a File object from the Blob
      const qrCodeFile = new File([blob], 'playlist-qr-code.png', { type: 'image/png' })
      
      // Use Web Share API with files
      await navigator.share({
        title: 'Join my TrackToss playlist!',
        text: 'Scan this QR code to join my playlist and add your favorite songs.',
        url: shareUrl,
        files: [qrCodeFile]
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
  } finally {
    // Reset sharing state
    isSharing = false
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
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // For mobile devices, use the device's native camera app
      const playlistId = window.location.pathname.split('/').pop()
      if (playlistId) {
        const playlistUrl = `${window.location.origin}/playlist/${playlistId}`
        // Open the URL in a new tab, which will trigger the device's native QR code scanner
        window.open(playlistUrl, '_blank')
      }
    } else {
      // For desktop devices, use the camera API
      scannerStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      // Set the video source
      videoElement.srcObject = scannerStream
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
          videoElement.play()
          resolve()
        }
      })

      // Create a BarcodeDetector
      const barcodeDetector = new BarcodeDetector({
        formats: ['qr_code']
      })
      
      // Start scanning loop
      async function scan() {
        try {
          const barcodes = await barcodeDetector.detect(videoElement)
          
          if (barcodes.length > 0) {
            const qrData = barcodes[0].rawValue
            console.log('QR Code detected:', qrData)
            
            // Try to parse the URL
            try {
              const url = new URL(qrData)
              // Extract playlist ID from the path
              const playlistId = url.pathname.split('/').pop()
              
              if (playlistId) {
                console.log('Found playlist ID:', playlistId)
                // Stop scanning
                handleCloseScanner()
                // Navigate to the playlist
                window.location.href = `/playlist/${playlistId}`
              }
            } catch (error) {
              console.error('Invalid QR code URL:', error)
            }
          }
        } catch (error) {
          console.error('Error scanning:', error)
        }
        
        // Continue scanning
        animationFrame = requestAnimationFrame(scan)
      }
      
      // Show scanner container
      scannerContainer.classList.remove('hidden')
      
      // Start scanning
      scan()
    }
  } catch (error) {
    console.error('Error starting scanner:', error)
    if (error.name === 'NotAllowedError') {
      alert('Camera access was denied. Please allow camera access in your browser settings.')
    } else if (error.name === 'NotFoundError') {
      alert('No camera found. Please make sure your device has a camera.')
    } else {
      alert('Unable to start camera. Please try again or refresh the page.')
    }
  }
} 