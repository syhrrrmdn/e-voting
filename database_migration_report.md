# Laporan Migrasi Database E-Voting: MongoDB ke Supabase (PostgreSQL)

Dokumen ini menjelaskan proses, arsitektur, dan langkah-langkah detail untuk migrasi database aplikasi E-Voting dari MongoDB (menggunakan Mongoose) ke Supabase (PostgreSQL).

---

## 1. Ringkasan Migrasi

Migrasi ini berhasil memindahkan database backend dari MongoDB ke **Supabase** dengan pendekatan **Mongoose Compatibility/Adapter Layer**. Pendekatan ini memungkinkan migrasi database secara menyeluruh tanpa harus menulis ulang 22 API routes yang sudah ada, sehingga menghemat waktu pengembangan dan meminimalkan risiko bug fungsionalitas.

### Komponen Utama yang Dibuat/Diubah:
- **Dependensi Baru**: `@supabase/supabase-js` ditambahkan, `mongoose` dihapus.
- **Supabase Client (`src/lib/supabase.ts`)**: Konfigurasi koneksi dengan serverless Supabase JS Client.
- **Database Query Adapter (`src/lib/db.ts`)**: Adaptor khusus yang mensimulasikan sintaks query Mongoose (seperti `.find()`, `.findOne()`, `.select()`, `.populate()`, `.sort()`, `.limit()`, dll.) dan menerjemahkannya ke format query Supabase/PostgREST.
- **Skema Relasional (`supabase_schema.sql`)**: Skema DDL lengkap untuk di-run pada editor SQL Supabase.
- **Model Baru (`src/models/*.ts`)**: 8 model dideklarasikan ulang menggunakan class `BaseModel` dari adaptor Supabase.
- **Diagnostic Connection**: Route `/api/db-check` dan komponen dashboard `SystemSettings.tsx` diperbarui untuk menampilkan status kesehatan koneksi database Supabase secara real-time.

---

## 2. Struktur Tabel Database (PostgreSQL)

Berikut adalah ringkasan pemetaan dari dokumen MongoDB ke tabel PostgreSQL:

| MongoDB Model | PostgreSQL Table | Jenis Kolom Khusus | Catatan |
| :--- | :--- | :--- | :--- |
| `User` | `"User"` | `jsonb` (`attributes`) | Menyimpan field dinamis pemilih |
| `UserCategory` | `"UserCategory"` | | Kategori pemilih (mahasiswa, dll.) |
| `DynamicAttribute` | `"DynamicAttribute"` | `jsonb` (`options`, `applicableTo`) | Atribut dinamis pemilih |
| `Election` | `"Election"` | `jsonb` (`candidates`, `rules`) | `candidates` menyimpan array UUID kandidat |
| `Candidate` | `"Candidate"` | `uuid` references `"Election"` | Relasi kandidat ke pemilihannya |
| `VoteRecord` | `"VoteRecord"` | `uuid` references `"Election"` / `"Candidate"` | Menyimpan log suara masuk. Unique (`userId`, `electionId`) |
| `AuditLog` | `"AuditLog"` | `jsonb` (`details`) | Log aktivitas sistem |
| `SystemSettings` | `"SystemSettings"` | | Konfigurasi global aplikasi |

---

## 3. Langkah Instalasi & Setup Database (Bagi Pengguna)

### Langkah 1: Setup Proyek di Supabase
1. Buka [Supabase Dashboard](https://supabase.com) dan buat proyek baru.
2. Dapatkan **Project URL** dan **Service Role Key** dari menu `Settings -> API`.

### Langkah 2: Eksekusi Skema Database SQL
1. Buka menu **SQL Editor** di dashboard Supabase Anda.
2. Buat query baru, salin seluruh isi file [supabase_schema.sql](file:///e:/project/magang/kedayweb/e-voting/supabase_schema.sql) ke editor.
3. Klik tombol **Run**. Ini akan membuat 8 tabel beserta foreign keys dan constraint unik untuk mencegah double-voting.

### Langkah 3: Konfigurasi Environment Variables
1. Buka file `.env` di direktori proyek Anda.
2. Tambahkan credentials Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```
3. Pastikan `MONGO_URI` yang lama telah dikomentari atau dihapus.

### Langkah 4: Seeding Data Awal
1. Jalankan aplikasi e-voting Anda secara lokal (`npm run dev`).
2. Panggil API seeding dengan mengirimkan request **POST** ke `http://localhost:3000/api/seed`. Anda bisa melakukannya lewat Postman atau langsung melalui halaman debug yang memicu route tersebut.
3. Database Supabase Anda sekarang telah terisi dengan data kategori, atribut dinamis, akun admin, akun voter, serta data pemilihan demo.

---

## 4. Keuntungan Arsitektur Baru

1. **Efisiensi Kode**: Pembuatan layer adapter `db.ts` meminimalkan sentuhan langsung pada controller API Next.js.
2. **Kinerja Relasional**: Fitur relasi database PostgreSQL (Foreign Keys, Cascade Delete) menjamin konsistensi data kandidat dan pemilih otomatis terjaga.
3. **Pencegahan Suara Ganda**: Constraint `unique_user_election` pada tabel `"VoteRecord"` dikelola langsung di level database engine (PostgreSQL), menjamin integritas voting meskipun ada pengiriman request konkuren/simultan.
