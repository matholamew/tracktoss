# TrackToss Database Setup

This directory contains the SQL files needed to set up the TrackToss database in Supabase.

## Files

- `init.sql`: Contains all the necessary SQL to set up the database, including:
  - Tables (playlists, songs)
  - Extensions (uuid-ossp, pg_cron)
  - Indexes
  - Row Level Security (RLS) policies
  - Cleanup function for expired playlists
  - Scheduled job for cleanup

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `init.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the SQL

## Database Structure

### Tables

#### playlists
- `id`: UUID (primary key)
- `created_at`: Timestamp
- `expires_at`: Timestamp
- `active`: Boolean

#### songs
- `id`: UUID (primary key)
- `playlist_id`: UUID (foreign key)
- `title`: Text
- `artist`: Text
- `service`: Text
- `external_id`: Text
- `thumbnail`: Text
- `preview_url`: Text
- `upvotes`: Integer
- `downvotes`: Integer
- `created_at`: Timestamp

### Security

The database uses Row Level Security (RLS) with the following policies:
- Public read access to active playlists
- Public read access to songs in active playlists
- Public insert access to songs
- Public update access to song votes

### Maintenance

The database includes an automated cleanup function that:
- Runs every hour
- Deletes songs from expired playlists
- Marks expired playlists as inactive 