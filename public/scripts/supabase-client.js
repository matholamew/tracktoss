import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm'

const supabaseUrl = 'https://prcokthtfcnmjiytcpcg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByY29rdGh0ZmNubWppeXRjcGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwOTkwMjYsImV4cCI6MjA1ODY3NTAyNn0.Gunr9T700cH98lCpcxD7PkueaHcs0UzP344tDIawKZo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 