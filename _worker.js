export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // Handle playlist routes
    if (url.pathname.startsWith('/playlist/')) {
      const playlistId = url.pathname.split('/')[2]
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(playlistId)) {
        return new Response('Invalid playlist ID format', { status: 400 })
      }
      
      // Return the playlist page
      return env.ASSETS.fetch(request)
    }
    
    // Handle all other routes
    return env.ASSETS.fetch(request)
  }
} 