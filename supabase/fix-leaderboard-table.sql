-- =============================================
-- FIX LEADERBOARD TABLE STRUCTURE
-- =============================================

-- Drop old leaderboard table if exists (backup first if needed!)
DROP TABLE IF EXISTS leaderboard CASCADE;

-- Create new leaderboard table with correct schema
CREATE TABLE leaderboard (
  id BIGSERIAL PRIMARY KEY,
  rank INTEGER DEFAULT 0,
  name TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Beginner',
  avatar TEXT,
  badges JSONB DEFAULT '[]',
  achievements INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX idx_leaderboard_points ON leaderboard(points DESC);

-- Add updated_at trigger
CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON leaderboard
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON leaderboard;
DROP POLICY IF EXISTS "Enable insert for all users" ON leaderboard;
DROP POLICY IF EXISTS "Enable update for all users" ON leaderboard;
DROP POLICY IF EXISTS "Enable delete for all users" ON leaderboard;

-- Create RLS policies (public read, public write - admin validation in app)
CREATE POLICY "Enable read access for all users"
ON leaderboard FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON leaderboard FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON leaderboard FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for all users"
ON leaderboard FOR DELETE
USING (true);

-- Verify table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'leaderboard' 
ORDER BY ordinal_position;
