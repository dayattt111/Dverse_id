-- =============================================
-- RLS POLICIES FOR PUBLIC ACCESS
-- Admin validation is handled at application level
-- =============================================

-- Enable RLS on all tables
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE career ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PORTFOLIO POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON portfolio;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON portfolio;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON portfolio;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON portfolio;
DROP POLICY IF EXISTS "Enable insert for all users" ON portfolio;
DROP POLICY IF EXISTS "Enable update for all users" ON portfolio;
DROP POLICY IF EXISTS "Enable delete for all users" ON portfolio;

-- Allow anyone to read portfolio
CREATE POLICY "Enable read access for all users"
ON portfolio FOR SELECT
USING (true);

-- Allow anyone to insert (admin validation handled in app)
CREATE POLICY "Enable insert for all users"
ON portfolio FOR INSERT
WITH CHECK (true);

-- Allow anyone to update (admin validation handled in app)
CREATE POLICY "Enable update for all users"
ON portfolio FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow anyone to delete (admin validation handled in app)
CREATE POLICY "Enable delete for all users"
ON portfolio FOR DELETE
USING (true);

-- =============================================
-- CAREER POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON career;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON career;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON career;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON career;
DROP POLICY IF EXISTS "Enable insert for all users" ON career;
DROP POLICY IF EXISTS "Enable update for all users" ON career;
DROP POLICY IF EXISTS "Enable delete for all users" ON career;

-- Allow anyone to read career
CREATE POLICY "Enable read access for all users"
ON career FOR SELECT
USING (true);

-- Allow anyone to insert (admin validation handled in app)
CREATE POLICY "Enable insert for all users"
ON career FOR INSERT
WITH CHECK (true);

-- Allow anyone to update (admin validation handled in app)
CREATE POLICY "Enable update for all users"
ON career FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow anyone to delete (admin validation handled in app)
CREATE POLICY "Enable delete for all users"
ON career FOR DELETE
USING (true);

-- =============================================
-- PROGRAMS POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON programs;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON programs;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON programs;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON programs;
DROP POLICY IF EXISTS "Enable insert for all users" ON programs;
DROP POLICY IF EXISTS "Enable update for all users" ON programs;
DROP POLICY IF EXISTS "Enable delete for all users" ON programs;

-- Allow anyone to read programs
CREATE POLICY "Enable read access for all users"
ON programs FOR SELECT
USING (true);

-- Allow anyone to insert (admin validation handled in app)
CREATE POLICY "Enable insert for all users"
ON programs FOR INSERT
WITH CHECK (true);

-- Allow anyone to update (admin validation handled in app)
CREATE POLICY "Enable update for all users"
ON programs FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow anyone to delete (admin validation handled in app)
CREATE POLICY "Enable delete for all users"
ON programs FOR DELETE
USING (true);

-- =============================================
-- SETTINGS POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON settings;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON settings;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON settings;
DROP POLICY IF EXISTS "Enable insert for all users" ON settings;
DROP POLICY IF EXISTS "Enable update for all users" ON settings;
DROP POLICY IF EXISTS "Enable delete for all users" ON settings;

-- Allow anyone to read settings
CREATE POLICY "Enable read access for all users"
ON settings FOR SELECT
USING (true);

-- Allow anyone to insert (admin validation handled in app)
CREATE POLICY "Enable insert for all users"
ON settings FOR INSERT
WITH CHECK (true);

-- Allow anyone to update (admin validation handled in app)
CREATE POLICY "Enable update for all users"
ON settings FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow anyone to delete (admin validation handled in app)
CREATE POLICY "Enable delete for all users"
ON settings FOR DELETE
USING (true);

-- =============================================
-- LEADERBOARD POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON leaderboard;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON leaderboard;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON leaderboard;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON leaderboard;
DROP POLICY IF EXISTS "Enable insert for all users" ON leaderboard;
DROP POLICY IF EXISTS "Enable update for all users" ON leaderboard;
DROP POLICY IF EXISTS "Enable delete for all users" ON leaderboard;

-- Allow anyone to read leaderboard
CREATE POLICY "Enable read access for all users"
ON leaderboard FOR SELECT
USING (true);

-- Allow anyone to insert (admin validation handled in app)
CREATE POLICY "Enable insert for all users"
ON leaderboard FOR INSERT
WITH CHECK (true);

-- Allow anyone to update (admin validation handled in app)
CREATE POLICY "Enable update for all users"
ON leaderboard FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow anyone to delete (admin validation handled in app)
CREATE POLICY "Enable delete for all users"
ON leaderboard FOR DELETE
USING (true);

-- =============================================
-- VERIFY POLICIES
-- =============================================
-- Run this to check all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
