-- ============================================================
-- Event Packages table + seed data
-- Run this migration AFTER event-participant.sql
-- ============================================================

-- 1. Create event_packages table
CREATE TABLE IF NOT EXISTS event_packages (
  id BIGSERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint on (event_id, code)
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_packages_event_code ON event_packages(event_id, code);

-- Index for querying by event
CREATE INDEX IF NOT EXISTS idx_event_packages_event_id ON event_packages(event_id);

-- Auto-update updated_at
CREATE TRIGGER update_event_packages_updated_at BEFORE UPDATE ON event_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. RLS policies
ALTER TABLE event_packages ENABLE ROW LEVEL SECURITY;

-- Public can read packages
CREATE POLICY "Enable read access for all users" ON event_packages FOR SELECT USING (true);

-- Only authenticated users (admin) can insert/update/delete
CREATE POLICY "Enable insert for authenticated users" ON event_packages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON event_packages FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON event_packages FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Add package_id to event_participant (nullable for backward compatibility)
ALTER TABLE event_participant ADD COLUMN IF NOT EXISTS package_id BIGINT REFERENCES event_packages(id);

-- 4. Seed data — 4 packages for Seminar GreenTech (event_id = 1)
INSERT INTO event_packages (event_id, name, code, price, discounted_price, items, description, is_bundle, sort_order) VALUES
(1, 'Paket A', 'A', 30000, 27000,
  ARRAY['Alat tulis', 'Goodie bag', 'Stiker', 'Ganci', 'Makanan berat + makanan ringan', 'Pin'],
  'Paket lengkap dengan semua merchandise dan makanan',
  false, 1),
(1, 'Paket B', 'B', 25000, 22000,
  ARRAY['Alat tulis', 'Goodie bag', 'Stiker', 'Makanan ringan + makanan berat'],
  'Paket standar dengan merchandise essential dan makanan',
  false, 2),
(1, 'Paket C', 'C', 125000, 115000,
  ARRAY['Baju eksklusif', 'Alat tulis', 'Goodie bag', 'Stiker', 'Ganci', 'Makanan berat + makanan ringan', 'Pin'],
  'Paket premium — Baju + Paket A',
  true, 3),
(1, 'Paket D', 'D', 120000, 110000,
  ARRAY['Baju eksklusif', 'Alat tulis', 'Goodie bag', 'Stiker', 'Makanan ringan + makanan berat'],
  'Paket bundle — Baju + Paket B',
  true, 4)
ON CONFLICT (event_id, code) DO NOTHING;

-- 5. Early bird config in settings table
-- Admin can toggle this on/off
INSERT INTO settings (id, data) VALUES
('early_bird_discount', '{"enabled": false, "maxCount": 10, "discountPercent": 10, "eventId": 1}'::jsonb)
ON CONFLICT (id) DO NOTHING;
