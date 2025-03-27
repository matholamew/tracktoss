-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to clean up expired playlists and their songs
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