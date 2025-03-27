-- Insert a new playlist
INSERT INTO playlists (id, created_at, expires_at, active)
VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    NOW(),
    NOW() + INTERVAL '24 hours',
    true
);

-- Insert songs
INSERT INTO songs (id, playlist_id, title, artist, service, service_id, thumbnail, preview_url, upvotes, downvotes, created_at)
VALUES 
    ('111e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Bohemian Rhapsody', 'Queen', 'spotify', 'spotify:track:3z8h0TU7ReDPLIbEnYhWZb', 'https://i.scdn.co/image/ab67616d0000b2739e2c5be7f42f59d1d8d0f1f0', 'https://open.spotify.com/track/3z8h0TU7ReDPLIbEnYhWZb', 10, 0, NOW()),
    ('222e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', 'Sweet Caroline', 'Neil Diamond', 'spotify', 'spotify:track:62AuGbAkt8Ox2IrFFb8GKV', 'https://i.scdn.co/image/ab67616d0000b2739e2c5be7f42f59d1d8d0f1f0', 'https://open.spotify.com/track/62AuGbAkt8Ox2IrFFb8GKV', 8, 1, NOW()),
    ('333e4567-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174000', 'Don''t Stop Believin''', 'Journey', 'spotify', 'spotify:track:4bHsxqR3GMrXTxEPLuK5ue', 'https://i.scdn.co/image/ab67616d0000b2739e2c5be7f42f59d1d8d0f1f0', 'https://open.spotify.com/track/4bHsxqR3GMrXTxEPLuK5ue', 12, 2, NOW()),
    ('444e4567-e89b-12d3-a456-426614174004', '123e4567-e89b-12d3-a456-426614174000', 'Livin'' on a Prayer', 'Bon Jovi', 'spotify', 'spotify:track:37ZJ0p5Jm13JPevGcx4SkF', 'https://i.scdn.co/image/ab67616d0000b2739e2c5be7f42f59d1d8d0f1f0', 'https://open.spotify.com/track/37ZJ0p5Jm13JPevGcx4SkF', 9, 1, NOW()),
    ('555e4567-e89b-12d3-a456-426614174005', '123e4567-e89b-12d3-a456-426614174000', 'Sweet Home Alabama', 'Lynyrd Skynyrd', 'spotify', 'spotify:track:7e89621JPkKae1QjR2uex9', 'https://i.scdn.co/image/ab67616d0000b2739e2c5be7f42f59d1d8d0f1f0', 'https://open.spotify.com/track/7e89621JPkKae1QjR2uex9', 7, 0, NOW()); 