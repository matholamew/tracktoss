// Spotify API Configuration
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const SPOTIFY_REDIRECT_URI = `${window.location.origin}/auth/spotify`

// YouTube Music API Configuration
const YOUTUBE_CLIENT_ID = import.meta.env.VITE_YOUTUBE_CLIENT_ID
const YOUTUBE_REDIRECT_URI = `${window.location.origin}/auth/youtube`

class MusicService {
  constructor() {
    this.spotifyToken = null
    this.spotifyTokenExpiry = null
    this.youtubeToken = null
    this.youtubeTokenExpiry = null
    this.loadStoredTokens()
  }

  loadStoredTokens() {
    // Load Spotify token
    const spotifyToken = localStorage.getItem('spotify_token')
    const spotifyExpiry = localStorage.getItem('spotify_token_expiry')
    if (spotifyToken && spotifyExpiry) {
      this.spotifyToken = spotifyToken
      this.spotifyTokenExpiry = parseInt(spotifyExpiry)
    }

    // Load YouTube token
    const youtubeToken = localStorage.getItem('youtube_token')
    const youtubeExpiry = localStorage.getItem('youtube_token_expiry')
    if (youtubeToken && youtubeExpiry) {
      this.youtubeToken = youtubeToken
      this.youtubeTokenExpiry = parseInt(youtubeExpiry)
    }
  }

  async searchSongs(query) {
    if (!query.trim()) return []

    try {
      // Search all platforms in parallel
      const [spotifyResults, youtubeResults] = await Promise.all([
        this.searchSpotify(query),
        this.searchYouTube(query)
      ])

      // Combine and sort results by relevance
      const allResults = [...spotifyResults, ...youtubeResults]
        .sort((a, b) => {
          // Prioritize exact matches in title
          const aExactMatch = a.title.toLowerCase().includes(query.toLowerCase())
          const bExactMatch = b.title.toLowerCase().includes(query.toLowerCase())
          if (aExactMatch && !bExactMatch) return -1
          if (!aExactMatch && bExactMatch) return 1
          
          // Then sort by service (Spotify first, then YouTube)
          if (a.service === 'spotify' && b.service === 'youtube') return -1
          if (a.service === 'youtube' && b.service === 'spotify') return 1
          
          return 0
        })

      return allResults
    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }

  async searchSpotify(query) {
    try {
      // Use client credentials flow for public search
      const token = await this.getSpotifyClientToken()
      
      const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Spotify API error')
      }

      const data = await response.json()
      return data.tracks.items.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        service: 'spotify',
        thumbnail: track.album.images[0]?.url,
        previewUrl: track.preview_url
      }))
    } catch (error) {
      console.error('Spotify search error:', error)
      return []
    }
  }

  async searchYouTube(query) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=10&key=${YOUTUBE_CLIENT_ID}`
      )

      if (!response.ok) {
        throw new Error('YouTube API error')
      }

      const data = await response.json()
      return data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        service: 'youtube',
        thumbnail: item.snippet.thumbnails.high.url
      }))
    } catch (error) {
      console.error('YouTube search error:', error)
      return []
    }
  }

  async getSpotifyClientToken() {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`
        },
        body: 'grant_type=client_credentials'
      })

      if (!response.ok) {
        throw new Error('Failed to get Spotify token')
      }

      const data = await response.json()
      return data.access_token
    } catch (error) {
      console.error('Error getting Spotify client token:', error)
      throw error
    }
  }

  // Spotify Authentication
  async authenticateSpotify() {
    // Generate random state for security
    const state = Math.random().toString(36).substring(7)
    localStorage.setItem('spotify_state', state)

    // Redirect to Spotify auth
    const authUrl = new URL('https://accounts.spotify.com/authorize')
    authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID)
    authUrl.searchParams.append('response_type', 'token')
    authUrl.searchParams.append('redirect_uri', SPOTIFY_REDIRECT_URI)
    authUrl.searchParams.append('state', state)
    authUrl.searchParams.append('scope', 'user-read-private user-read-email user-library-read')

    window.location.href = authUrl.toString()
  }

  handleSpotifyCallback(hash) {
    const params = new URLSearchParams(hash.substring(1))
    const state = params.get('state')
    const storedState = localStorage.getItem('spotify_state')

    if (state !== storedState) {
      throw new Error('Invalid state parameter')
    }

    const token = params.get('access_token')
    const expiresIn = parseInt(params.get('expires_in'))
    
    if (token) {
      this.spotifyToken = token
      this.spotifyTokenExpiry = Date.now() + (expiresIn * 1000)
      localStorage.setItem('spotify_token', token)
      localStorage.setItem('spotify_token_expiry', this.spotifyTokenExpiry.toString())
      localStorage.removeItem('spotify_state')
      return true
    }

    return false
  }

  // YouTube Authentication
  async authenticateYouTube() {
    // Generate random state for security
    const state = Math.random().toString(36).substring(7)
    localStorage.setItem('youtube_state', state)

    // Redirect to YouTube auth
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.append('client_id', YOUTUBE_CLIENT_ID)
    authUrl.searchParams.append('redirect_uri', YOUTUBE_REDIRECT_URI)
    authUrl.searchParams.append('response_type', 'token')
    authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/youtube.readonly')
    authUrl.searchParams.append('state', state)

    window.location.href = authUrl.toString()
  }

  handleYouTubeCallback(hash) {
    const params = new URLSearchParams(hash.substring(1))
    const state = params.get('state')
    const storedState = localStorage.getItem('youtube_state')

    if (state !== storedState) {
      throw new Error('Invalid state parameter')
    }

    const token = params.get('access_token')
    const expiresIn = parseInt(params.get('expires_in'))
    
    if (token) {
      this.youtubeToken = token
      this.youtubeTokenExpiry = Date.now() + (expiresIn * 1000)
      localStorage.setItem('youtube_token', token)
      localStorage.setItem('youtube_token_expiry', this.youtubeTokenExpiry.toString())
      localStorage.removeItem('youtube_state')
      return true
    }

    return false
  }

  // Token Management
  clearSpotifyToken() {
    this.spotifyToken = null
    this.spotifyTokenExpiry = null
    localStorage.removeItem('spotify_token')
    localStorage.removeItem('spotify_token_expiry')
  }

  clearYoutubeToken() {
    this.youtubeToken = null
    this.youtubeTokenExpiry = null
    localStorage.removeItem('youtube_token')
    localStorage.removeItem('youtube_token_expiry')
  }

  isSpotifyTokenExpired() {
    return !this.spotifyTokenExpiry || Date.now() >= this.spotifyTokenExpiry
  }

  isYoutubeTokenExpired() {
    return !this.youtubeTokenExpiry || Date.now() >= this.youtubeTokenExpiry
  }

  // Auth Status
  isSpotifyAuthenticated() {
    return !!this.spotifyToken && !this.isSpotifyTokenExpired()
  }

  isYouTubeAuthenticated() {
    return !!this.youtubeToken && !this.isYoutubeTokenExpired()
  }
}

export const musicService = new MusicService() 