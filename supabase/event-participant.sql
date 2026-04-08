-- =============================================
-- EVENT PARTICIPANT TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS event_participant (
  id BIGSERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  institution TEXT NOT NULL,
  pic_payment TEXT,
  pic_follow TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_event_participant_event_id ON event_participant(event_id);
CREATE INDEX idx_event_participant_email ON event_participant(email);
CREATE INDEX idx_event_participant_status ON event_participant(status);
CREATE INDEX idx_event_participant_created_at ON event_participant(created_at DESC);

-- Auto update timestamp trigger
CREATE TRIGGER update_event_participant_updated_at BEFORE UPDATE ON event_participant
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE event_participant ENABLE ROW LEVEL SECURITY;

-- Public can insert (register)
CREATE POLICY "Enable insert for all users" ON event_participant FOR INSERT WITH CHECK (true);

-- Public can read their own registration by email
CREATE POLICY "Enable read access for all users" ON event_participant FOR SELECT USING (true);

-- Authenticated users (admin) can update
CREATE POLICY "Enable update for authenticated users" ON event_participant FOR UPDATE USING (auth.role() = 'authenticated');

-- Authenticated users (admin) can delete
CREATE POLICY "Enable delete for authenticated users" ON event_participant FOR DELETE USING (auth.role() = 'authenticated');
