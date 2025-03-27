-- Grant necessary permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Grant specific permissions for playlists table
GRANT SELECT, INSERT ON playlists TO anon;

-- Grant specific permissions for songs table
GRANT SELECT, INSERT, UPDATE ON songs TO anon;

-- Grant execute permission on the cleanup function
GRANT EXECUTE ON FUNCTION cleanup_expired_playlists() TO anon; 