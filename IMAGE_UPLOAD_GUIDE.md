# Image Upload Feature - Admin

Fitur upload gambar telah ditambahkan ke halaman admin untuk Portfolio, Career, dan Programs.

## 📁 File yang Dibuat/Dimodifikasi

### Komponen Baru
- `src/components/admin/image-upload.tsx` - Komponen reusable untuk upload image

### File yang Dimodifikasi
1. `src/app/dcn-admin/portfolio/page.tsx` - Tambah upload image untuk project
2. `src/app/dcn-admin/career/page.tsx` - Tambah upload logo perusahaan
3. `src/app/dcn-admin/programs/page.tsx` - Tambah upload image program
4. `storage.rules` - Firebase Storage security rules
5. `firebase.json` - Konfigurasi storage rules

## 🚀 Cara Menggunakan

### Di Admin Panel

1. **Portfolio**
   - Buka halaman Admin Portfolio
   - Klik "Tambah Project" atau edit project existing
   - Klik tombol "Pilih Gambar" di bagian "Project Image"
   - Pilih file gambar (JPG, PNG, GIF, atau WebP)
   - Gambar akan otomatis di-upload ke Firebase Storage
   - URL gambar akan tersimpan di Firestore

2. **Career**
   - Buka halaman Admin Career
   - Klik "Tambah Job" atau edit job existing
   - Upload logo perusahaan dengan klik "Pilih Gambar"
   - Logo akan disimpan di folder `career/logos`

3. **Programs**
   - Buka halaman Admin Programs
   - Upload gambar program saat create/edit
   - Gambar disimpan di folder `programs`

## 📋 Spesifikasi

### Validasi
- ✅ Format: JPG, PNG, GIF, WebP
- ✅ Ukuran maksimal: 5MB
- ✅ Auto-generate unique filename dengan timestamp
- ✅ Preview sebelum upload
- ✅ Progress bar saat upload

### Fitur
- Upload image ke Firebase Storage
- Preview gambar setelah upload
- Ganti gambar yang sudah di-upload
- Hapus gambar (dari storage dan form)
- Error handling dengan pesan yang jelas

## 🔒 Security

Firebase Storage Rules sudah dikonfigurasi:
- Public read untuk semua gambar
- Write hanya untuk authenticated users
- Validasi file type dan size di server-side
- Struktur folder terorganisir

## 🗂️ Struktur Folder Storage

```
firebase-storage/
├── portfolio/
│   └── {timestamp}_{filename}.jpg
├── career/
│   └── logos/
│       └── {timestamp}_{filename}.png
├── programs/
│   └── {timestamp}_{filename}.jpg
└── images/
    └── {timestamp}_{filename}.jpg
```

## 🔧 Deploy Storage Rules

Untuk deploy storage rules ke Firebase:

```bash
firebase deploy --only storage
```

Atau deploy semua:

```bash
firebase deploy
```

## 💡 Tips

1. Gunakan gambar dengan resolusi yang sesuai (recommend: 1200x800px untuk portfolio/programs)
2. Compress gambar sebelum upload untuk performa lebih baik
3. Gunakan format WebP untuk ukuran file lebih kecil
4. Logo perusahaan sebaiknya square (1:1 ratio)

## 🐛 Troubleshooting

### Upload gagal
- Pastikan file < 5MB
- Pastikan format file valid (JPG, PNG, GIF, WebP)
- Pastikan koneksi internet stabil
- Cek console browser untuk error detail

### Storage permission denied
- Deploy storage rules: `firebase deploy --only storage`
- Pastikan user sudah login di admin panel
- Cek Firebase Console > Storage > Rules

### Gambar tidak muncul
- Pastikan Firebase Storage sudah enabled di Firebase Console
- Cek URL gambar valid di Firestore
- Cek CORS settings di Firebase Storage
