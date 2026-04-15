-- =============================================
-- HACKATHON PARTICIPANTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS hackathon_participants (
  id BIGSERIAL PRIMARY KEY,
  team_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  email TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  leader_phone TEXT NOT NULL,
  leader_identity_url TEXT NOT NULL,  -- PDF from Supabase Storage
  members JSONB NOT NULL,  -- [{name: string, identity_url: string}, ...]
  proposal_url TEXT NOT NULL,  -- PDF from Supabase Storage
  status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  notes TEXT,  -- Admin notes for verification
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hackathon_participants_email ON hackathon_participants(email);
CREATE INDEX IF NOT EXISTS idx_hackathon_participants_team_name ON hackathon_participants(team_name);
CREATE INDEX IF NOT EXISTS idx_hackathon_participants_status ON hackathon_participants(status);
CREATE INDEX IF NOT EXISTS idx_hackathon_participants_created_at ON hackathon_participants(created_at DESC);

-- Auto update timestamp trigger
CREATE TRIGGER update_hackathon_participants_updated_at BEFORE UPDATE ON hackathon_participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE hackathon_participants ENABLE ROW LEVEL SECURITY;

-- Public can insert (register)
CREATE POLICY "Enable insert for all users" ON hackathon_participants FOR INSERT WITH CHECK (true);

-- Public can read all registrations (for public stats)
CREATE POLICY "Enable read access for all users" ON hackathon_participants FOR SELECT USING (true);

-- Authenticated users (admin) can update
CREATE POLICY "Enable update for authenticated users" ON hackathon_participants FOR UPDATE USING (auth.role() = 'authenticated');

-- Authenticated users (admin) can delete
CREATE POLICY "Enable delete for authenticated users" ON hackathon_participants FOR DELETE USING (auth.role() = 'authenticated');
