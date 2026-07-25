# 🗳️ MudaVote - Platform E-Voting Organisasi Modern

**MudaVote** adalah sistem informasi pemilihan umum elektronik (E-Voting) berbasis web yang aman, transparan, dan terstruktur. Sistem ini memfasilitasi pemungutan suara digital untuk berbagai tingkat organisasi (kampus, sekolah, komunitas, maupun institusi) dengan dukungan **Multi-Role Access (Admin, Election Admin, Voter)**, **Rule Engine Kriteria Pemilih Dinamis**, **Supabase Auth & PostgreSQL**, **Cloudinary Media Storage**, dan **Cetak PDF Berita Acara Rekapitulasi Suara**.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [Supabase Auth](https://supabase.com/docs/guides/auth) & [NextAuth.js](https://next-auth.js.org/)
- **Database Backend**: [PostgreSQL (Supabase Cloud)](https://supabase.com/)
- **Storage / Media Management**: [Cloudinary SDK](https://cloudinary.com/)
- **Styling & Icons**: [Tailwind CSS v4](https://tailwindcss.com/)
- **PDF Generation**: Native Browser Print Engine + Responsive CSS `@media print`
- **Deployment Target**: [Vercel](https://vercel.com/)

---

## 🔒 Fitur Utama & Keamanan

1. **Supabase Auth & Multi-Role Authentication**:
   - Pendaftaran dan masuk akun via **Supabase Auth**.
   - Hak akses berbasis peran (*Role-Based Access Control*):
     - `admin`: Mengelola pengguna, kategori, atribut dinamis, audit log, dan pengaturan sistem.
     - `election_admin`: Membuat & mengelola pemilihan, mendaftarkan kandidat, memantau perolehan suara realtime, dan mencetak Berita Acara PDF.
     - `voter`: Melihat daftar pemilihan aktif, menyalurkan suara (voting), dan melihat hasil akhir.
2. **Keamanan Pemungutan Suara (Anti Double-Voting)**:
   - Diberlakukan constraint unik `UNIQUE("userId", "electionId")` pada database PostgreSQL.
   - Pengecekan sesi server-side untuk memastikan 1 pemilih hanya dapat menyalurkan 1 suara per pemilihan.
   - Kerahasiaan suara: Perolehan suara realtime dikunci (*masked*) untuk publik selama pemungutan suara berlangsung dan baru dibuka setelah status pemilu `closed`.
3. **Rule Engine Eligibilitas Pemilih Dinamis**:
   - Pemilihan dapat dikonfigurasi dengan aturan logika kompleks (`AND`, `OR`, `NOT`) berbasis atribut pengguna (misal: Angkatan, Jurusan, Status).
4. **Validasi Pemilihan Tidak Sah (Invalid)**:
   - Pemilihan yang ditutup tanpa adanya suara masuk (0 Suara) secara otomatis ditetapkan **TIDAK SAH (INVALID)** pada antarmuka publik dan dokumen Berita Acara PDF.
5. **PDF Berita Acara Rekapitulasi Suara**:
   - Cetak Berita Acara resmi format A4 yang dilengkapi Kop Surat, nomor dokumen otomatis, tabel rekapitulasi, stempel digital, dan 3 kolom tanda tangan panitia/saksi.
6. **Cloudinary Media Upload**:
   - Foto avatar dan foto kandidat diunggah secara aman ke Cloudinary melalui server Route Handler `/api/upload` yang terlindungi.
7. **Row Level Security (RLS)**:
   - RLS diaktifkan (`ENABLE ROW LEVEL SECURITY`) pada seluruh tabel PostgreSQL Supabase dengan SQL policy terstruktur.

---

## ⚙️ Environment Variables Setup

Buat file `.env` di root direktori project dan isi dengan variabel berikut:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_long_secret_key_here

# SMTP Configuration (Reset Password Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM="MudaVote E-Voting"
```

---

## 🗄️ Inisialisasi Database (Supabase PostgreSQL)

1. Buka **Supabase Dashboard** -> pilih project Anda.
2. Masuk ke **SQL Editor**.
3. Jalankan seluruh skrip SQL yang berada pada berkas `supabase_schema.sql`.
4. Jalankan seeder akun awal dengan mengakses endpoint `/api/seed` pada aplikasi lokal.

---

## 🛠️ Langkah Menjalankan Project

```bash
# 1. Install dependensi
npm install

# 2. Jalankan server pengembangan
npm run dev

# 3. Buka browser
http://localhost:3000
```

---

## 🚀 Deployment ke Vercel

1. Push repository ke GitHub / GitLab.
2. Import repository di dashboard **Vercel**.
3. Masukkan seluruh variabel lingkungan (*Environment Variables*) dari file `.env` ke dalam menu settings Vercel.
4. Klik **Deploy**.
