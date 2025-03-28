import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, YOUTUBE_CLIENT_ID } from './config.js'
import config from './config.js'

// Spotify API Configuration
const SPOTIFY_REDIRECT_URI = config.SPOTIFY_REDIRECT_URI;

// YouTube Music API Configuration
const YOUTUBE_REDIRECT_URI = config.YOUTUBE_REDIRECT_URI;

class MusicService {
  constructor() {
    // Initialize music service
  }

  async searchSongs(query) {
    // Placeholder for future implementation
    return [];
  }
}

export const musicService = new MusicService(); 