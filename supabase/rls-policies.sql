-- =============================================
-- RLS POLICIES FOR PUBLIC READ ACCESS
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

-- Allow anyone to read programs
CREATE POLICY "Enable read access for all users"
ON programs FOR SELECT
USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Enable insert for authenticated users only"
ON programs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Enable update for authenticated users only"
ON programs FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete
CREATE POLICY "Enable delete for authenticated users only"
ON programs FOR DELETE
TO authenticated
USIDrop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON settings;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON settings;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON settings;

-- NG (true);

-- =============================================
-- SETTINGS POLICIES
-- =============================================

-- Allow anyone to read settings
CREATE POLICY "Enable read access for all users"
ON settings FOR SELECT
USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Enable insert for authenticated users only"
ON settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Enable update for authenticated users only"
ON settings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete
CREATE POLICY "Enable delete for authenticated users only"
ON settings FOR DELETE
TO authenticated
USIDrop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON leaderboard;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON leaderboard;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON leaderboard;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON leaderboard;

-- NG (true);

-- =============================================
-- LEADERBOARD POLICIES
-- =============================================

-- Allow anyone to read leaderboard
CREATE POLICY "Enable read access for all users"
ON leaderboard FOR SELECT
USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Enable insert for authenticated users only"
ON leaderboard FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update
CREATE POLICY "Enable update for authenticated users only"
ON leaderboard FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete
CREATE POLICY "Enable delete for authenticated users only"
ON leaderboard FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- VERIFY POLICIES
-- =============================================
-- Run this to check all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
