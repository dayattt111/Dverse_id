-- =============================================
-- 002: Events Table
-- Run AFTER 001-auth-roles.sql
-- =============================================

-- Drop existing events table (and cascade to FKs) for a fresh start
DROP TABLE IF EXISTS public.events CASCADE;

CREATE TABLE public.events (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  location TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  max_participants INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);

-- Auto-update updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed: Seminar GreenTech & Hackathon
INSERT INTO public.events (id, name, slug, description, event_date, location, image_url, status, max_participants)
VALUES
  (1, 'Seminar GreenTech', 'seminar-greentech',
   'Seminar GreenTech oleh D-Verse (Developer Universe) — Dipanegara Computer Club',
   '2026-05-09 09:00:00+08', 'Politeknik Negeri Ujung Pandang, Makassar',
   'https://omwdnhmxmanhdzuznrks.supabase.co/storage/v1/object/public/event_images/Sem.jpeg',
   'published', 250),
  (2, 'Hackathon 48 Jam', 'hackathon-48-jam',
   'Hackathon 48 Jam — Kompetisi coding intensif oleh D-Verse',
   NULL, 'Politeknik Negeri Ujung Pandang, Makassar',
   NULL, 'draft', 100)
ON CONFLICT (slug) DO NOTHING;

-- Reset sequence to avoid ID conflicts with seed data
SELECT setval(pg_get_serial_sequence('public.events', 'id'), COALESCE((SELECT MAX(id) FROM public.events), 1), true);
