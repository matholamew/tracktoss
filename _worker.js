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
      
      // Try to fetch playlist.html
      try {
        const playlistResponse = await env.ASSETS.fetch(new Request(new URL('/playlist.html', url.origin)))
        if (!playlistResponse.ok) {
          console.error('Failed to fetch playlist.html:', playlistResponse.status)
          return new Response('Playlist page not found', { status: 404 })
        }
        return playlistResponse
      } catch (error) {
        console.error('Error fetching playlist.html:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }
    
    // Handle all other routes
    return env.ASSETS.fetch(request)
  }
} 