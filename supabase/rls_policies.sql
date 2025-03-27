-- Enable RLS on tables
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to active playlists" ON playlists;
DROP POLICY IF EXISTS "Allow public insert access to playlists" ON playlists;
DROP POLICY IF EXISTS "Allow public read access to songs" ON songs;
DROP POLICY IF EXISTS "Allow public insert access to songs" ON songs;
DROP POLICY IF EXISTS "Allow public update access to songs" ON songs;

-- Create new policies for playlists
CREATE POLICY "Allow public read access to active playlists"
    ON playlists FOR SELECT
    USING (active = true);

CREATE POLICY "Allow public insert access to playlists"
    ON playlists FOR INSERT
    WITH CHECK (true);

-- Create new policies for songs
CREATE POLICY "Allow public read access to songs"
    ON songs FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert access to songs"
    ON songs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update access to songs"
    ON songs FOR UPDATE
    USING (true)
    WITH CHECK (true); 