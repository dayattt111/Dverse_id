-- =============================================
-- 004: RLS Policies (Admin-Only Write)
-- Run AFTER 003-recreate-tables.sql
-- =============================================

-- Enable RLS on all tables
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE career ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participant ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PUBLIC READ for all tables
-- =============================================
CREATE POLICY "Public read" ON portfolio FOR SELECT USING (true);
CREATE POLICY "Public read" ON career FOR SELECT USING (true);
CREATE POLICY "Public read" ON programs FOR SELECT USING (true);
CREATE POLICY "Public read" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Public read" ON settings FOR SELECT USING (true);
CREATE POLICY "Public read" ON event_packages FOR SELECT USING (true);
CREATE POLICY "Public read" ON event_participant FOR SELECT USING (true);
CREATE POLICY "Public read" ON events FOR SELECT USING (true);

-- =============================================
-- ADMIN-ONLY WRITE (INSERT / UPDATE / DELETE)
-- Uses public.is_admin() from 001-auth-roles.sql
-- =============================================

-- portfolio
CREATE POLICY "Admin insert" ON portfolio FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update" ON portfolio FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete" ON portfolio FOR DELETE USING (public.is_admin());

-- career
CREATE POLICY "Admin insert" ON career FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update" ON career FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete" ON career FOR DELETE USING (public.is_admin());

-- programs
CREATE POLICY "Admin insert" ON programs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update" ON programs FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete" ON programs FOR DELETE USING (public.is_admin());

-- leaderboard
CREATE POLICY "Admin insert" ON leaderboard FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update" ON leaderboard FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete" ON leaderboard FOR DELETE USING (public.is_admin());

-- settings
CREATE POLICY "Admin insert" ON settings FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update" ON settings FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete" ON settings FOR DELETE USING (public.is_admin());

-- events
CREATE POLICY "Admin insert" ON events FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update" ON events FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete" ON events FOR DELETE USING (public.is_admin());

-- event_packages
CREATE POLICY "Admin insert" ON event_packages FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admin update" ON event_packages FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete" ON event_packages FOR DELETE USING (public.is_admin());

-- event_participant — special: public can INSERT (registration), admin can UPDATE/DELETE
CREATE POLICY "Public insert" ON event_participant FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update" ON event_participant FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin delete" ON event_participant FOR DELETE USING (public.is_admin());

-- =============================================
-- STORAGE POLICIES (run in Supabase Dashboard → Storage → Policies)
-- =============================================
-- Bucket "images":
--   SELECT: public (true)
--   INSERT: public (true) — participants upload payment/follow proof
--   UPDATE: is_admin()
--   DELETE: is_admin()
--
-- Bucket "event_images":
--   SELECT: public (true)
--   INSERT: is_admin()
--   UPDATE: is_admin()
--   DELETE: is_admin()
