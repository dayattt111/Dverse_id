-- =============================================
-- 001: User Roles & Admin Helper
-- Run this FIRST in Supabase SQL Editor
-- =============================================

-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'peserta' CHECK (role IN ('admin', 'peserta')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Auto-update updated_at
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Auto-create user_roles row when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (id, role)
  VALUES (NEW.id, 'peserta');
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 4. RLS for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Everyone can read their own role
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = id);

-- Admin can read all roles
CREATE POLICY "Admin can read all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin());

-- Only admin can update roles
CREATE POLICY "Admin can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.is_admin());

-- No one can insert manually (handled by trigger)
-- No one can delete (cascade from auth.users handles it)

-- =============================================
-- HOW TO MAKE FIRST ADMIN:
-- =============================================
-- 1. Create a user in Supabase Dashboard → Authentication → Users → Add User
-- 2. Run this SQL (replace with your user's UUID):
--
--    UPDATE public.user_roles SET role = 'admin'
--    WHERE id = 'YOUR-USER-UUID-HERE';
--
-- =============================================
