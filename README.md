# TrackToss

A crowdsourced playlist web application that allows users to create and join playlists using QR codes.

## Features

- Create and join playlists via QR codes
- Add songs from Spotify and YouTube Music
- Vote on songs to influence the playlist order
- Real-time updates
- Mobile-friendly design

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Set up the configuration file:
   ```bash
   cp public/scripts/config.example.js public/scripts/config.js
   ```
   Then edit `public/scripts/config.js` with your actual API credentials:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SPOTIFY_CLIENT_ID`: Your Spotify client ID
   - `SPOTIFY_REDIRECT_URI`: Your Spotify redirect URI
   - `YOUTUBE_CLIENT_ID`: Your YouTube client ID
   - `YOUTUBE_REDIRECT_URI`: Your YouTube redirect URI
5. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment to Cloudflare Pages

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Log in to your Cloudflare account and go to Pages

3. Click "Create a project"

4. Choose "Connect to Git"

5. Select your repository

6. Configure the build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`

7. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

8. Click "Save and Deploy"

## Environment Variables

The following environment variables are required:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## License

MIT 