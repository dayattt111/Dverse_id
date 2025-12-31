# Firebase Storage Setup Guide

## 🔥 Langkah-langkah Setup Firebase Storage

### 1. Enable Firebase Storage

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project **dcn-undipa**
3. Di menu sidebar kiri, klik **Build** > **Storage**
4. Klik tombol **Get Started**
5. Pilih **Start in production mode** atau **test mode**
6. Pilih lokasi server (pilih yang terdekat, misalnya `asia-southeast2` untuk Jakarta)
7. Klik **Done**

### 2. Configure Storage Rules

Setelah Storage aktif, update security rules:

1. Di Firebase Console > Storage, klik tab **Rules**
2. Replace dengan rules berikut:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isValidSize() {
      return request.resource.size < 5 * 1024 * 1024; // 5MB
    }
    
    function isImage() {
      return request.resource.contentType.matches('image/.*');
    }
    
    // Public read, authenticated write untuk semua folder
    match /{allPaths=**} {
      allow read: if true;
      allow write: if isAuthenticated() && isValidSize();
    }
  }
}
```

3. Klik **Publish**

### 3. Deploy Storage Rules via CLI (Opsional)

Jika Anda sudah punya file `storage.rules`, deploy via terminal:

```bash
firebase deploy --only storage
```

### 4. Verifikasi Setup

Cek apakah Storage bucket sudah aktif:

1. Buka Firebase Console > Storage
2. Seharusnya muncul bucket: `dcn-undipa.firebasestorage.app`
3. Coba upload file manual untuk test

### 5. Test Upload dari Admin

1. Login ke admin panel: `/dcn-admin/login`
2. Password: `dcn-undipa-the-best-2025`
3. Buka Portfolio/Career/Programs admin
4. Klik "Tambah" dan coba upload gambar
5. Cek Console Browser (F12) untuk melihat log upload

## 🔍 Troubleshooting

### Error: "Firebase Storage is not enabled"

**Solusi:**
- Pastikan Storage sudah di-enable di Firebase Console
- Restart development server: `bun dev`

### Error: "Permission denied"

**Solusi:**
1. Cek Storage Rules di Firebase Console
2. Pastikan rules allow public read dan authenticated write
3. Cek apakah user sudah login di admin

### Error: "CORS policy blocked"

**Solusi:**
1. Firebase Storage otomatis handle CORS untuk domain yang sama
2. Jika masih error, tambahkan CORS config:

Buat file `cors.json`:
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

Deploy dengan gsutil:
```bash
gsutil cors set cors.json gs://dcn-undipa.firebasestorage.app
```

### URL tidak lengkap atau tidak valid

**Cek:**
- Browser Console untuk error detail
- Download URL harus berformat: `https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}`
- Pastikan `getDownloadURL()` dipanggil setelah upload selesai

### Upload stuck di 0% atau 100%

**Solusi:**
- Clear browser cache
- Coba file yang lebih kecil
- Cek koneksi internet
- Restart browser

## ✅ Checklist Setup

- [ ] Firebase Storage enabled di Console
- [ ] Storage Rules sudah di-publish
- [ ] Bucket name: `dcn-undipa.firebasestorage.app`
- [ ] Test upload manual di Firebase Console berhasil
- [ ] Environment variables sudah benar di `.env.local`
- [ ] Development server sudah di-restart

## 📝 Notes

- Upload maksimal 5MB per file
- Format support: JPG, PNG, GIF, WebP
- Files akan tersimpan dengan struktur:
  - `portfolio/{timestamp}_{filename}`
  - `career/logos/{timestamp}_{filename}`
  - `programs/{timestamp}_{filename}`

## 🆘 Need Help?

Jika masih ada masalah:
1. Cek Browser Console (F12) untuk error detail
2. Cek Firebase Console > Storage > Usage untuk melihat aktivitas
3. Pastikan Storage quota tidak habis (free tier: 5GB)
