-- =============================================
-- 003: Recreate All Tables (Fresh Start)
-- Run AFTER 002-events-table.sql
-- =============================================
-- WARNING: This drops and recreates all data tables.
-- Only run this if you chose "fresh start".

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DROP existing tables (order matters for FKs)
-- =============================================
DROP TABLE IF EXISTS event_participant CASCADE;
DROP TABLE IF EXISTS event_packages CASCADE;
DROP TABLE IF EXISTS portfolio CASCADE;
DROP TABLE IF EXISTS career CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- =============================================
-- PORTFOLIO
-- =============================================
CREATE TABLE portfolio (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  category TEXT NOT NULL CHECK (category IN ('web', 'mobile', 'ml', 'cloud', 'game', 'other')),
  tech_stack TEXT[] DEFAULT '{}',
  creator JSONB DEFAULT '{}',
  links JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  completed_date TEXT,
  program_source TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portfolio_slug ON portfolio(slug);
CREATE INDEX idx_portfolio_category ON portfolio(category);
CREATE INDEX idx_portfolio_featured ON portfolio(featured);
CREATE INDEX idx_portfolio_created_at ON portfolio(created_at DESC);

CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON portfolio
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CAREER
-- =============================================
CREATE TABLE career (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  company TEXT NOT NULL,
  company_logo TEXT,
  location TEXT NOT NULL,
  work_type TEXT NOT NULL CHECK (work_type IN ('remote', 'onsite', 'hybrid')),
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  salary_range TEXT,
  benefits TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  experience TEXT,
  posted_date TEXT NOT NULL,
  deadline_date TEXT,
  apply_url TEXT,
  contact_email TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'closed')) DEFAULT 'active',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_career_slug ON career(slug);
CREATE INDEX idx_career_status ON career(status);
CREATE INDEX idx_career_featured ON career(featured);
CREATE INDEX idx_career_work_type ON career(work_type);
CREATE INDEX idx_career_created_at ON career(created_at DESC);

CREATE TRIGGER update_career_updated_at BEFORE UPDATE ON career
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PROGRAMS
-- =============================================
CREATE TABLE programs (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  image TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'upcoming', 'completed')) DEFAULT 'upcoming',
  participants INTEGER DEFAULT 0,
  start_date TEXT,
  end_date TEXT,
  registration_deadline TEXT,
  category TEXT NOT NULL CHECK (category IN ('bootcamp', 'study-group', 'event', 'workshop', 'competition')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_programs_slug ON programs(slug);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_category ON programs(category);
CREATE INDEX idx_programs_created_at ON programs(created_at DESC);

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- LEADERBOARD
-- =============================================
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX idx_leaderboard_points ON leaderboard(points DESC);

CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON leaderboard
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SETTINGS
-- =============================================
CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO settings (id, data) VALUES
  ('community_stats', '{"totalMembers": 100, "activeProjects": 50, "successRate": 95, "yearsExperience": 5}'::jsonb),
  ('early_bird_discount', '{"enabled": false, "maxCount": 10, "discountPercent": 10, "eventId": 1}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- EVENT PACKAGES (FK → events)
-- =============================================
CREATE TABLE event_packages (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  price INTEGER NOT NULL,
  discounted_price INTEGER,
  items TEXT[] DEFAULT '{}',
  image TEXT,
  description TEXT,
  is_bundle BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_event_packages_event_code ON event_packages(event_id, code);
CREATE INDEX idx_event_packages_event_id ON event_packages(event_id);

CREATE TRIGGER update_event_packages_updated_at BEFORE UPDATE ON event_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed packages for Seminar GreenTech (event_id = 1)
INSERT INTO event_packages (event_id, name, code, price, discounted_price, items, description, is_bundle, sort_order) VALUES
  (1, 'Paket A', 'A', 30000, 27000,
    ARRAY['Alat tulis', 'Goodie bag', 'Stiker', 'Ganci', 'Makanan berat + makanan ringan', 'Pin'],
    'Paket lengkap dengan semua merchandise dan makanan', false, 1),
  (1, 'Paket B', 'B', 25000, 22000,
    ARRAY['Alat tulis', 'Goodie bag', 'Stiker', 'Makanan ringan + makanan berat'],
    'Paket standar dengan merchandise essential dan makanan', false, 2),
  (1, 'Paket C', 'C', 125000, 115000,
    ARRAY['Baju eksklusif', 'Alat tulis', 'Goodie bag', 'Stiker', 'Ganci', 'Makanan berat + makanan ringan', 'Pin'],
    'Paket premium — Baju + Paket A', true, 3),
  (1, 'Paket D', 'D', 120000, 110000,
    ARRAY['Baju eksklusif', 'Alat tulis', 'Goodie bag', 'Stiker', 'Makanan ringan + makanan berat'],
    'Paket bundle — Baju + Paket B', true, 4)
ON CONFLICT (event_id, code) DO NOTHING;

-- =============================================
-- EVENT PARTICIPANT (FK → events, FK → event_packages)
-- =============================================
CREATE TABLE event_participant (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  package_id BIGINT REFERENCES event_packages(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  institution TEXT NOT NULL,
  pic_payment TEXT,
  pic_follow TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_participant_event_id ON event_participant(event_id);
CREATE INDEX idx_event_participant_email ON event_participant(email);
CREATE INDEX idx_event_participant_status ON event_participant(status);
CREATE INDEX idx_event_participant_created_at ON event_participant(created_at DESC);

CREATE TRIGGER update_event_participant_updated_at BEFORE UPDATE ON event_participant
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
