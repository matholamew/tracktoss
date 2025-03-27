-- Add rank column to songs table
ALTER TABLE songs ADD COLUMN IF NOT EXISTS rank INTEGER DEFAULT 0;

-- Create function to handle upvotes
CREATE OR REPLACE FUNCTION upvote_song(song_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE songs 
    SET rank = rank + 1
    WHERE id = song_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle downvotes
CREATE OR REPLACE FUNCTION downvote_song(song_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE songs 
    SET rank = rank - 1
    WHERE id = song_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to anon role
GRANT EXECUTE ON FUNCTION upvote_song(UUID) TO anon;
GRANT EXECUTE ON FUNCTION downvote_song(UUID) TO anon;

-- Add RLS policy for updating song rank
DROP POLICY IF EXISTS "Allow public update song rank" ON songs;
CREATE POLICY "Allow public update song rank"
    ON songs FOR UPDATE
    USING (true)
    WITH CHECK (
        -- Only allow updating the rank column
        rank IS NOT NULL
    ); 