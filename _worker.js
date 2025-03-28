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