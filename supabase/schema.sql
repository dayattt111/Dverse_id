-- =============================================
-- DCN UNDIPA Database Schema for Supabase
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PORTFOLIO TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS portfolio (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for portfolio
CREATE INDEX idx_portfolio_slug ON portfolio(slug);
CREATE INDEX idx_portfolio_category ON portfolio(category);
CREATE INDEX idx_portfolio_featured ON portfolio(featured);
CREATE INDEX idx_portfolio_created_at ON portfolio(created_at DESC);

-- =============================================
-- CAREER TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS career (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for career
CREATE INDEX idx_career_slug ON career(slug);
CREATE INDEX idx_career_status ON career(status);
CREATE INDEX idx_career_featured ON career(featured);
CREATE INDEX idx_career_work_type ON career(work_type);
CREATE INDEX idx_career_created_at ON career(created_at DESC);

-- =============================================
-- PROGRAMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS programs (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for programs
CREATE INDEX idx_programs_slug ON programs(slug);
CREATE INDEX idx_programs_status ON programs(status);
CREATE INDEX idx_programs_category ON programs(category);
CREATE INDEX idx_programs_created_at ON programs(created_at DESC);

-- =============================================
-- SETTINGS TABLE (for community stats)
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default community stats with correct field names
INSERT INTO settings (id, data) VALUES (
  'community_stats',
  '{"totalMembers": 100, "activeProjects": 50, "successRate": 95, "yearsExperience": 5}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- LEADERBOARD TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS leaderboard (
  id BIGSERIAL PRIMARY KEY,
  contributor_name TEXT NOT NULL,
  contributor_role TEXT NOT NULL,
  contributor_avatar TEXT,
  total_classes INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  github_url TEXT,
  linkedin_url TEXT,
  rank INTEGER,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for leaderboard
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX idx_leaderboard_total_classes ON leaderboard(total_classes DESC);

-- =============================================
-- AUTO UPDATE TIMESTAMP FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for auto-updating updated_at
CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON portfolio
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_updated_at BEFORE UPDATE ON career
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE career ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Enable read access for all users" ON portfolio FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON career FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON programs FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON settings FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON leaderboard FOR SELECT USING (true);

-- Authenticated users can insert/update/delete (for admin)
CREATE POLICY "Enable insert for authenticated users only" ON portfolio FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON portfolio FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON portfolio FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON career FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON career FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON career FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON programs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON programs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON programs FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON settings FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON leaderboard FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON leaderboard FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON leaderboard FOR DELETE USING (auth.role() = 'authenticated');
