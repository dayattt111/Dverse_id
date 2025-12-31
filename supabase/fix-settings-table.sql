-- =============================================
-- FIX SETTINGS TABLE STRUCTURE
-- =============================================

-- Add created_at column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'settings' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE settings ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Add updated_at trigger for settings
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update or insert the correct community stats data
INSERT INTO settings (id, data) VALUES (
  'community_stats',
  '{"totalMembers": 100, "activeProjects": 50, "successRate": 95, "yearsExperience": 5}'::jsonb
) 
ON CONFLICT (id) DO UPDATE 
SET data = EXCLUDED.data;

-- Verify the data
SELECT id, data, created_at, updated_at FROM settings WHERE id = 'community_stats';
