-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create playlists table
CREATE TABLE IF NOT EXISTS playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL
);

-- Create songs table
CREATE TABLE IF NOT EXISTS songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    service TEXT NOT NULL,  -- 'spotify' or 'youtube'
    service_id TEXT NOT NULL,
    thumbnail TEXT,
    preview_url TEXT,
    upvotes INTEGER DEFAULT 0 NOT NULL,
    downvotes INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(playlist_id, service_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_playlists_expires_at ON playlists(expires_at);
CREATE INDEX IF NOT EXISTS idx_playlists_active ON playlists(active);
CREATE INDEX IF NOT EXISTS idx_songs_playlist_id ON songs(playlist_id);
CREATE INDEX IF NOT EXISTS idx_songs_votes ON songs(upvotes DESC, downvotes ASC);

-- Set up Row Level Security (RLS)
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to active playlists" ON playlists;
DROP POLICY IF EXISTS "Allow public insert access to playlists" ON playlists;
DROP POLICY IF EXISTS "Allow public read access to songs in active playlists" ON songs;
DROP POLICY IF EXISTS "Allow public insert access to songs" ON songs;
DROP POLICY IF EXISTS "Allow public update access to song votes" ON songs;

-- Create policies
CREATE POLICY "Allow public read access to active playlists"
    ON playlists FOR SELECT
    USING (active = true);

CREATE POLICY "Allow public insert access to playlists"
    ON playlists FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public read access to songs in active playlists"
    ON songs FOR SELECT
    USING (
        playlist_id IN (
            SELECT id FROM playlists WHERE active = true
        )
    );

CREATE POLICY "Allow public insert access to songs"
    ON songs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update access to song votes"
    ON songs FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Create function to clean up expired playlists
CREATE OR REPLACE FUNCTION cleanup_expired_playlists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete songs from expired playlists
    DELETE FROM songs
    WHERE playlist_id IN (
        SELECT id 
        FROM playlists 
        WHERE expires_at < NOW() 
        AND active = true
    );

    -- Mark expired playlists as inactive
    UPDATE playlists
    SET active = false
    WHERE expires_at < NOW()
    AND active = true;
END;
$$;

-- Create a scheduled job to run the cleanup function
SELECT cron.schedule(
    'cleanup-expired-playlists',  -- job name
    '0 * * * *',                 -- every hour
    $$
    SELECT cleanup_expired_playlists();
    $$
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION cleanup_expired_playlists() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_playlists() TO anon; 