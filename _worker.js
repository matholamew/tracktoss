export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // Handle asset requests first
    if (url.pathname.startsWith('/assets/')) {
      try {
        const response = await env.ASSETS.fetch(request)
        if (!response.ok) {
          console.error('Failed to fetch asset:', response.status, request.url)
          return new Response('Asset not found', { status: 404 })
        }
        return response
      } catch (error) {
        console.error('Error fetching asset:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle playlist routes - serve individual playlist HTML files
    if (url.pathname.startsWith('/playlist/')) {
      const playlistId = url.pathname.split('/')[2]
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(playlistId)) {
        return new Response('Invalid playlist ID format', { status: 400 })
      }
      
      // Try to fetch the specific playlist HTML file
      try {
        const response = await env.ASSETS.fetch(new Request(new URL(`/playlist/${playlistId}.html`, url.origin)))
        if (!response.ok) {
          console.error('Failed to fetch playlist HTML:', response.status)
          return new Response('Playlist not found', { status: 404 })
        }
        return response
      } catch (error) {
        console.error('Error fetching playlist HTML:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }

    // Handle playlists route
    if (url.pathname === '/playlists') {
      try {
        const response = await env.ASSETS.fetch(new Request(new URL('/playlists.html', url.origin)))
        if (!response.ok) {
          console.error('Failed to fetch playlists.html:', response.status)
          return new Response('Playlists page not found', { status: 404 })
        }
        return response
      } catch (error) {
        console.error('Error fetching playlists.html:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }
    
    // Handle static files
    if (url.pathname.endsWith('.html') || url.pathname.endsWith('.css') || url.pathname.endsWith('.ico')) {
      try {
        const response = await env.ASSETS.fetch(request)
        if (!response.ok) {
          console.error('Failed to fetch static file:', response.status, request.url)
          return new Response('File not found', { status: 404 })
        }
        return response
      } catch (error) {
        console.error('Error fetching static file:', error)
        return new Response('Internal Server Error', { status: 500 })
      }
    }
    
    // For all other routes, serve index.html for SPA routing
    try {
      const response = await env.ASSETS.fetch(new Request(new URL('/index.html', url.origin)))
      if (!response.ok) {
        console.error('Failed to fetch index.html:', response.status)
        return new Response('Application not found', { status: 404 })
      }
      return response
    } catch (error) {
      console.error('Error fetching index.html:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }
} 