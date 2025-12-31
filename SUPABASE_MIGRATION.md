# 🚀 Migration Guide: Firebase to Supabase

## 📋 Overview

Panduan lengkap untuk migrasi dari Firebase ke Supabase untuk project DCN UNDIPA.

## 🎯 Kenapa Migrasi ke Supabase?

- ✅ **Open Source** - Full control atas data
- ✅ **PostgreSQL** - Database relational yang powerful
- ✅ **Real-time** - Built-in real-time subscriptions
- ✅ **Pricing** - Lebih cost-effective
- ✅ **Storage** - Integrated storage dengan S3-compatible API
- ✅ **Auth** - Built-in authentication system
- ✅ **Row Level Security** - Advanced security policies

## 📦 Step 1: Setup Supabase Project

### 1.1 Create Supabase Project

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Klik **New Project**
3. Isi detail project:
   - **Name**: `dcn-undipa`
   - **Database Password**: Simpan password ini dengan aman
   - **Region**: Pilih terdekat (Singapore/Jakarta)
4. Tunggu project selesai setup (~2 menit)

### 1.2 Get API Credentials

1. Di dashboard Supabase, buka **Settings** > **API**
2. Copy credentials berikut:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon/public key**: `eyJhbGc...` (panjang)

### 1.3 Update Environment Variables

Tambahkan ke file `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Keep Firebase for now (optional backup during migration)
# NEXT_PUBLIC_FIREBASE_API_KEY=...
```

## 📊 Step 2: Create Database Schema

### 2.1 Run SQL Schema

1. Buka Supabase Dashboard > **SQL Editor**
2. Klik **New Query**
3. Copy isi file `supabase/schema.sql`
4. Paste dan klik **Run**
5. Verify tables created: **Database** > **Tables**

Tables yang dibuat:
- ✅ `portfolio`
- ✅ `career`
- ✅ `programs`
- ✅ `settings`
- ✅ `leaderboard`

### 2.2 Verify Tables

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check row count
SELECT 'portfolio' as table, COUNT(*) FROM portfolio
UNION ALL
SELECT 'career', COUNT(*) FROM career
UNION ALL
SELECT 'programs', COUNT(*) FROM programs;
```

## 🔄 Step 3: Migrate Data from Firebase

### 3.1 Export Data from Firebase

1. Buka Firebase Console > Firestore
2. Export collections:
   - `portfolio`
   - `career`
   - `programs`
   - `settings`
   
### 3.2 Import to Supabase

Saya akan membuat script migration. Untuk saat ini, Anda bisa import manual:

1. **Via Supabase Dashboard**:
   - Table Editor > Insert Row (untuk data sedikit)

2. **Via Script** (recommended):
```bash
# Jalankan migration script
bun run migrate:firebase-to-supabase
```

## 🔐 Step 4: Setup Authentication

### 4.1 Configure Auth

1. Supabase Dashboard > **Authentication** > **Providers**
2. Enable **Email** provider
3. Configure redirect URLs:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: `http://localhost:3000/dcn-admin/**`

### 4.2 Create Admin User

```sql
-- Via SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'admin@dcn-undipa.com',
  crypt('dcn-undipa-the-best-2025', gen_salt('bf')),
  NOW()
);
```

Atau gunakan Supabase Dashboard > Authentication > Add User

## 💾 Step 5: Setup Storage

### 5.1 Create Storage Buckets

1. Supabase Dashboard > **Storage**
2. Buat buckets:
   - `portfolio`
   - `career-logos`
   - `programs`

### 5.2 Configure Bucket Policies

Untuk setiap bucket:
```sql
-- Public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

-- Authenticated upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio' AND auth.role() = 'authenticated');

-- Authenticated delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'portfolio' AND auth.role() = 'authenticated');
```

## 🔧 Step 6: Update Code

### 6.1 Files Sudah Dibuat

- ✅ `src/lib/supabase/config.ts` - Supabase client config
- ✅ `src/lib/supabase/portfolio.ts` - Portfolio functions
- ✅ `src/lib/supabase/career.ts` - Career functions
- ✅ `supabase/schema.sql` - Database schema

### 6.2 Files yang Perlu Diupdate

Saya akan update file-file berikut untuk menggunakan Supabase:

1. **Admin Pages**:
   - `src/app/dcn-admin/portfolio/page.tsx`
   - `src/app/dcn-admin/career/page.tsx`
   - `src/app/dcn-admin/programs/page.tsx`
   
2. **Public Pages**:
   - `src/app/portfolio/_components/portfolio-page-content.tsx`
   - `src/app/career/_components/career-page-content.tsx`
   - `src/app/_components/home-portfolio.tsx`
   - `src/app/_components/home-career.tsx`

3. **Image Upload**:
   - `src/components/admin/image-upload.tsx` (update untuk Supabase Storage)

## ✅ Step 7: Testing

### 7.1 Test Checklist

- [ ] Database connection works
- [ ] Can fetch portfolio data
- [ ] Can fetch career data
- [ ] Can add new items via admin
- [ ] Can update items via admin
- [ ] Can delete items via admin
- [ ] Image upload works
- [ ] Public pages display data correctly
- [ ] Search/filter works

### 7.2 Run Tests

```bash
# Start dev server
bun dev

# Test pages:
# - http://localhost:3000
# - http://localhost:3000/portfolio
# - http://localhost:3000/career
# - http://localhost:3000/dcn-admin/login
```

## 🗑️ Step 8: Cleanup (Optional)

Setelah migrasi sukses dan data verified:

1. **Keep Firebase as backup** (recommended for 1-2 weeks)
2. Download backup dari Firebase
3. Disable Firebase services (jangan hapus project dulu)
4. Remove Firebase dependencies:
```bash
bun remove firebase
```

## 🆘 Troubleshooting

### Connection Issues

```typescript
// Test connection
import { supabase } from '@/lib/supabase/config'

const test = await supabase.from('portfolio').select('count')
console.log(test)
```

### RLS Policy Errors

Jika error "permission denied":
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'portfolio';

-- Temporarily disable RLS for testing
ALTER TABLE portfolio DISABLE ROW LEVEL SECURITY;
```

### Migration Script Fails

- Check database connection
- Verify API keys in .env.local
- Check Supabase dashboard for errors

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 🎯 Next Steps

Setelah migrasi selesai, Anda bisa:

1. **Enable Real-time**: Subscribe to database changes
2. **Add Full-text Search**: PostgreSQL built-in search
3. **Setup Edge Functions**: Serverless functions di Supabase
4. **Add Database Triggers**: Auto-update timestamps, etc.
5. **Setup Backup**: Automated daily backups

---

**Need Help?** Cek error di browser console dan Supabase dashboard logs.
