import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, YOUTUBE_CLIENT_ID } from './config.js'
import config from './config.js'

// Spotify API Configuration
const SPOTIFY_REDIRECT_URI = `${window.location.origin}/auth/spotify`

// YouTube Music API Configuration
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
  authenticateSpotify() {
    const clientId = config.SPOTIFY_CLIENT_ID;
    const redirectUri = config.SPOTIFY_REDIRECT_URI;
    const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';
    
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
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
  authenticateYouTube() {
    const clientId = config.YOUTUBE_CLIENT_ID;
    const redirectUri = config.YOUTUBE_REDIRECT_URI;
    const scope = 'https://www.googleapis.com/auth/youtube.readonly';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
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