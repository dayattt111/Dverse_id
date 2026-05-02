-- =============================================
-- COMPETITIVE PROGRAMMING PARTICIPANTS TABLE
-- =============================================
-- Event ID: 2 (Competitive Programming — D-Verse 2026)
-- Tabel ini menyimpan data peserta lomba Competitive Programming
-- yang mendaftar melalui halaman /registration?event=2
--
-- Field yang di-cover:
--   • Data Ketua / Individu (nama, email, no. hp, institusi, ktm)
--   • Data Anggota (opsional, maks. 1 orang)
--   • Bukti pembayaran & follow Instagram
--   • Tipe pendaftaran (individu / tim)
--   • Status verifikasi admin
-- =============================================

-- Pastikan fungsi trigger update_updated_at_column sudah ada
-- (biasanya dibuat di schema.sql / migrations utama)
-- Jika belum, jalankan blok berikut terlebih dahulu:
/*
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
*/

-- =============================================
-- 1. TABEL UTAMA
-- =============================================
CREATE TABLE IF NOT EXISTS competitive_programming_participants (
  -- Primary key
  id                        BIGSERIAL PRIMARY KEY,

  -- Relasi ke tabel events (event_id = 2 untuk Competitive Programming)
  event_id                  INTEGER NOT NULL DEFAULT 2,

  -- ── Tipe Pendaftaran ──────────────────────────────────────────────
  -- 'individual' = mendaftar sendiri
  -- 'team'       = mendaftar sebagai tim (maks. 2 orang)
  registration_type         TEXT NOT NULL
                              CHECK (registration_type IN ('individual', 'team'))
                              DEFAULT 'individual',

  -- ── Data Ketua / Individu ─────────────────────────────────────────
  leader_name               TEXT NOT NULL,
  leader_email              TEXT NOT NULL,
  leader_phone              TEXT NOT NULL,
  leader_institution        TEXT NOT NULL,
  -- URL file KTM/Kartu Pelajar ketua di Supabase Storage
  leader_pic_ktm            TEXT,

  -- ── Data Anggota (hanya untuk tipe 'team') ────────────────────────
  member_name               TEXT,
  member_email              TEXT,
  member_phone              TEXT,
  member_institution        TEXT,
  -- URL file KTM/Kartu Pelajar anggota di Supabase Storage
  member_pic_ktm            TEXT,

  -- ── Bukti Pembayaran & Follow ─────────────────────────────────────
  -- Biaya pendaftaran: Rp 35.000
  -- Transfer ke BCA: 1100782886 / DANA: 081351687138 (a/n Safira Muztasyifah Syah)
  pic_payment               TEXT,    -- URL bukti pembayaran (JPG/PNG ≤ 5MB)
  pic_follow                TEXT,    -- URL bukti follow @dverse.id (JPG/PNG ≤ 5MB)

  -- ── Status Verifikasi ─────────────────────────────────────────────
  -- 'pending'  : baru mendaftar, menunggu verifikasi admin
  -- 'verified' : pembayaran & dokumen sudah diverifikasi
  -- 'rejected' : ditolak (mis. bukti tidak valid)
  status                    TEXT NOT NULL
                              CHECK (status IN ('pending', 'verified', 'rejected'))
                              DEFAULT 'pending',

  -- Catatan admin (alasan penolakan, dsb.)
  admin_notes               TEXT,

  -- ── Timestamps ───────────────────────────────────────────────────
  created_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_cp_participants_event_id
  ON competitive_programming_participants(event_id);

CREATE INDEX IF NOT EXISTS idx_cp_participants_leader_email
  ON competitive_programming_participants(leader_email);

CREATE INDEX IF NOT EXISTS idx_cp_participants_status
  ON competitive_programming_participants(status);

CREATE INDEX IF NOT EXISTS idx_cp_participants_registration_type
  ON competitive_programming_participants(registration_type);

CREATE INDEX IF NOT EXISTS idx_cp_participants_created_at
  ON competitive_programming_participants(created_at DESC);

-- =============================================
-- 3. TRIGGER — auto-update updated_at
-- =============================================
CREATE TRIGGER update_cp_participants_updated_at
  BEFORE UPDATE ON competitive_programming_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE competitive_programming_participants ENABLE ROW LEVEL SECURITY;

-- Siapapun (public) bisa INSERT (mendaftar lomba)
CREATE POLICY "cp_participants_insert_public"
  ON competitive_programming_participants
  FOR INSERT
  WITH CHECK (true);

-- Siapapun bisa SELECT (untuk pengecekan duplikasi & statistik publik)
CREATE POLICY "cp_participants_select_public"
  ON competitive_programming_participants
  FOR SELECT
  USING (true);

-- Hanya authenticated (admin) yang bisa UPDATE status/notes
CREATE POLICY "cp_participants_update_admin"
  ON competitive_programming_participants
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Hanya authenticated (admin) yang bisa DELETE
CREATE POLICY "cp_participants_delete_admin"
  ON competitive_programming_participants
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- 5. UNIQUE CONSTRAINT — cegah double registrasi
-- =============================================
-- Satu email ketua hanya boleh terdaftar SATU KALI per event
ALTER TABLE competitive_programming_participants
  ADD CONSTRAINT uq_cp_leader_email_per_event
  UNIQUE (event_id, leader_email);

-- =============================================
-- 6. MIGRATION — tambahkan kolom baru ke event_participant
--    (jika sudah menggunakan tabel event_participant)
-- =============================================
-- Jika project sudah menggunakan tabel event_participant untuk semua event,
-- jalankan ALTER TABLE berikut untuk menambahkan kolom yang belum ada:

ALTER TABLE event_participant
  ADD COLUMN IF NOT EXISTS registration_type       TEXT CHECK (registration_type IN ('individual', 'team')) DEFAULT 'individual',
  ADD COLUMN IF NOT EXISTS team_member_name        TEXT,
  ADD COLUMN IF NOT EXISTS team_member_email       TEXT,
  ADD COLUMN IF NOT EXISTS team_member_phone       TEXT,
  ADD COLUMN IF NOT EXISTS team_member_institution TEXT,
  ADD COLUMN IF NOT EXISTS team_member_pic_ktm     TEXT,
  ADD COLUMN IF NOT EXISTS pic_ktm                 TEXT,
  ADD COLUMN IF NOT EXISTS package_id              INTEGER;

-- Index tambahan untuk event_participant (jika belum ada)
CREATE INDEX IF NOT EXISTS idx_event_participant_registration_type
  ON event_participant(registration_type);

-- =============================================
-- 7. CATATAN PEMAKAIAN
-- =============================================
-- Pilihan 1 (RECOMMENDED):
--   Gunakan tabel `event_participant` yang sudah ada + jalankan
--   ALTER TABLE di bagian 6 di atas. Data semua event (seminar, CP, dll.)
--   tersimpan terpusat dan dibedakan via event_id.
--
-- Pilihan 2 (ALTERNATIF):
--   Gunakan tabel `competitive_programming_participants` yang terpisah
--   (bagian 1–5) jika ingin skema yang benar-benar independen.
--
-- Project ini saat ini sudah menggunakan tabel `event_participant`
-- dengan event_id = 1 (Seminar) dan event_id = 2 (Competitive Programming).
-- Maka PILIHAN 1 adalah yang dipakai — cukup jalankan ALTER TABLE di bagian 6.
