// ============================================================
// E-Voting System - Dummy Data
// Satu sistem dengan banyak pemilihan & aturan hak pilih dinamis
// ============================================================

import {
  User,
  DynamicAttribute,
  Election,
  Candidate,
  AuditLog,
  RuleGroup,
  VoteRecord,
} from '@/types';

// --- Dynamic Attributes ---
export const dummyAttributes: DynamicAttribute[] = [
  {
    id: 'attr-1',
    key: 'fakultas',
    label: 'Fakultas',
    type: 'select',
    options: ['Teknik Informatika', 'Ekonomi', 'Hukum', 'Kedokteran', 'FISIP'],
    required: true,
    createdAt: '2025-01-20',
  },
  {
    id: 'attr-2',
    key: 'angkatan',
    label: 'Angkatan',
    type: 'number',
    options: [],
    required: true,
    createdAt: '2025-01-20',
  },
  {
    id: 'attr-3',
    key: 'jurusan',
    label: 'Jurusan',
    type: 'select',
    options: ['Informatika', 'Sistem Informasi', 'Manajemen', 'Akuntansi', 'Ilmu Hukum', 'Pendidikan Dokter', 'Ilmu Politik'],
    required: true,
    createdAt: '2025-01-25',
  },
  {
    id: 'attr-4',
    key: 'status_mahasiswa',
    label: 'Status Mahasiswa',
    type: 'select',
    options: ['Aktif', 'Cuti', 'Alumni', 'DO'],
    required: true,
    createdAt: '2025-02-01',
  },
  {
    id: 'attr-5',
    key: 'semester',
    label: 'Semester',
    type: 'number',
    options: [],
    required: false,
    createdAt: '2025-02-05',
  },
  {
    id: 'attr-6',
    key: 'divisi',
    label: 'Divisi',
    type: 'select',
    options: ['Akademik', 'Kemahasiswaan', 'Humas', 'Keuangan', 'IT'],
    required: false,
    createdAt: '2025-02-10',
  },
  {
    id: 'attr-7',
    key: 'jabatan',
    label: 'Jabatan',
    type: 'select',
    options: ['Mahasiswa', 'Dosen', 'Staff', 'Ketua Program Studi', 'Dekan'],
    required: false,
    createdAt: '2025-02-15',
  },
];

// --- Users ---
export const dummyUsers: User[] = [
  {
    id: 'user-1',
    name: 'Andi Prasetyo',
    email: 'andi@mudavote.ac.id',
    role: 'admin',
    attributes: { fakultas: 'Teknik Informatika', jurusan: 'Informatika', angkatan: 2022, status_mahasiswa: 'Aktif', semester: 6, divisi: 'IT', jabatan: 'Staff' },
    createdAt: '2025-01-15',
    status: 'active',
  },
  {
    id: 'user-2',
    name: 'Sari Dewi',
    email: 'sari@mudavote.ac.id',
    role: 'election_admin',
    attributes: { fakultas: 'Ekonomi', jurusan: 'Manajemen', angkatan: 2021, status_mahasiswa: 'Aktif', semester: 8, divisi: 'Kemahasiswaan', jabatan: 'Staff' },
    createdAt: '2025-01-16',
    status: 'active',
  },
  {
    id: 'user-3',
    name: 'Budi Santoso',
    email: 'budi@mudavote.ac.id',
    role: 'voter',
    attributes: { fakultas: 'Teknik Informatika', jurusan: 'Informatika', angkatan: 2023, status_mahasiswa: 'Aktif', semester: 4 },
    createdAt: '2025-02-10',
    status: 'active',
  },
  {
    id: 'user-4',
    name: 'Rina Kartika',
    email: 'rina@mudavote.ac.id',
    role: 'voter',
    attributes: { fakultas: 'Hukum', jurusan: 'Ilmu Hukum', angkatan: 2022, status_mahasiswa: 'Cuti', semester: 5 },
    createdAt: '2025-02-15',
    status: 'inactive',
  },
  {
    id: 'user-5',
    name: 'Dimas Nugroho',
    email: 'dimas@mudavote.ac.id',
    role: 'voter',
    attributes: { fakultas: 'FISIP', jurusan: 'Ilmu Politik', angkatan: 2024, status_mahasiswa: 'Aktif', semester: 2 },
    createdAt: '2025-03-01',
    status: 'active',
  },
  {
    id: 'user-6',
    name: 'Maya Anggraini',
    email: 'maya@mudavote.ac.id',
    role: 'election_admin',
    attributes: { fakultas: 'Kedokteran', jurusan: 'Pendidikan Dokter', angkatan: 2020, status_mahasiswa: 'Aktif', semester: 10, divisi: 'Akademik', jabatan: 'Dosen' },
    createdAt: '2025-03-12',
    status: 'active',
  },
  {
    id: 'user-7',
    name: 'Fajar Rahman',
    email: 'fajar@mudavote.ac.id',
    role: 'voter',
    attributes: { fakultas: 'Teknik Informatika', jurusan: 'Informatika', angkatan: 2022, status_mahasiswa: 'Aktif', semester: 6 },
    createdAt: '2025-03-20',
    status: 'active',
  },
  {
    id: 'user-8',
    name: 'Lestari Putri',
    email: 'lestari@mudavote.ac.id',
    role: 'voter',
    attributes: { fakultas: 'Ekonomi', jurusan: 'Akuntansi', angkatan: 2023, status_mahasiswa: 'Aktif', semester: 4 },
    createdAt: '2025-04-01',
    status: 'active',
  },
  {
    id: 'user-9',
    name: 'Hendra Wijaya',
    email: 'hendra@mudavote.ac.id',
    role: 'voter',
    attributes: { fakultas: 'Teknik Informatika', jurusan: 'Sistem Informasi', angkatan: 2022, status_mahasiswa: 'Aktif', semester: 6 },
    createdAt: '2025-04-10',
    status: 'active',
  },
  {
    id: 'user-10',
    name: 'Novi Rahmawati',
    email: 'novi@mudavote.ac.id',
    role: 'voter',
    attributes: { fakultas: 'Ekonomi', jurusan: 'Manajemen', angkatan: 2024, status_mahasiswa: 'Aktif', semester: 2 },
    createdAt: '2025-04-15',
    status: 'active',
  },
];

// --- Candidates ---
export const dummyCandidates: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Ahmad Rizky',
    description: 'Kandidat BEM dengan visi meningkatkan kesejahteraan mahasiswa melalui program beasiswa dan kegiatan akademik.',
    image: '',
    electionId: 'elec-1',
    voteCount: 342,
  },
  {
    id: 'cand-2',
    name: 'Putri Handayani',
    description: 'Fokus pada pengembangan soft skills mahasiswa dan membangun ekosistem startup kampus.',
    image: '',
    electionId: 'elec-1',
    voteCount: 289,
  },
  {
    id: 'cand-3',
    name: 'Bagus Setiawan',
    description: 'Program utama: digitalisasi kampus dan peningkatan fasilitas laboratorium.',
    image: '',
    electionId: 'elec-1',
    voteCount: 198,
  },
  {
    id: 'cand-4',
    name: 'Dewi Lestari',
    description: 'Berpengalaman dalam organisasi tingkat nasional, fokus pada peningkatan prestasi mahasiswa Informatika.',
    image: '',
    electionId: 'elec-2',
    voteCount: 156,
  },
  {
    id: 'cand-5',
    name: 'Reza Firmansyah',
    description: 'Komitmen pada transparansi keuangan HIMA dan pemberdayaan kegiatan mahasiswa jurusan.',
    image: '',
    electionId: 'elec-2',
    voteCount: 201,
  },
];

// --- Election Rules ---
const bemRules: RuleGroup = {
  id: 'rg-1',
  logic: 'AND',
  conditions: [
    { id: 'rc-1', field: 'status_mahasiswa', operator: '=', value: 'Aktif' },
    { id: 'rc-2', field: 'angkatan', operator: 'IN', value: ['2022', '2023', '2024'] },
  ],
  groups: [],
};

const himaInformatikaRules: RuleGroup = {
  id: 'rg-3',
  logic: 'AND',
  conditions: [
    { id: 'rc-5', field: 'status_mahasiswa', operator: '=', value: 'Aktif' },
    { id: 'rc-6', field: 'fakultas', operator: '=', value: 'Teknik Informatika' },
  ],
  groups: [],
};

const senatRules: RuleGroup = {
  id: 'rg-4',
  logic: 'AND',
  conditions: [
    { id: 'rc-7', field: 'status_mahasiswa', operator: '=', value: 'Aktif' },
    { id: 'rc-8', field: 'angkatan', operator: 'IN', value: ['2021', '2022', '2023'] },
  ],
  groups: [
    {
      id: 'rg-5',
      logic: 'OR',
      conditions: [
        { id: 'rc-9', field: 'fakultas', operator: '=', value: 'Teknik Informatika' },
        { id: 'rc-10', field: 'fakultas', operator: '=', value: 'Ekonomi' },
      ],
      groups: [],
    },
  ],
};

// --- Elections ---
export const dummyElections: Election[] = [
  {
    id: 'elec-1',
    title: 'Pemilihan Ketua BEM 2025/2026',
    description: 'Pemilihan Ketua Badan Eksekutif Mahasiswa periode 2025/2026. Seluruh mahasiswa aktif berhak memilih.',
    createdBy: 'Sari Dewi',
    startTime: '2025-06-01T08:00:00',
    endTime: '2025-06-03T17:00:00',
    status: 'active',
    candidates: [dummyCandidates[0], dummyCandidates[1], dummyCandidates[2]],
    rules: bemRules,
    totalVotes: 829,
    createdAt: '2025-05-01',
  },
  {
    id: 'elec-2',
    title: 'Pemilihan Ketua HIMA Informatika',
    description: 'Pemilihan Ketua Himpunan Mahasiswa Informatika periode 2025/2026. Hanya mahasiswa Fakultas Teknik Informatika.',
    createdBy: 'Sari Dewi',
    startTime: '2025-07-10T08:00:00',
    endTime: '2025-07-12T17:00:00',
    status: 'published',
    candidates: [dummyCandidates[3], dummyCandidates[4]],
    rules: himaInformatikaRules,
    totalVotes: 357,
    createdAt: '2025-06-15',
  },
  {
    id: 'elec-3',
    title: 'Pemilihan Ketua Senat Mahasiswa',
    description: 'Pemilihan Ketua Senat Mahasiswa. Hanya mahasiswa aktif FTI & FE angkatan 2021-2023.',
    createdBy: 'Maya Anggraini',
    startTime: '2025-08-01T08:00:00',
    endTime: '2025-08-03T17:00:00',
    status: 'draft',
    candidates: [],
    rules: senatRules,
    totalVotes: 0,
    createdAt: '2025-07-01',
  },
  {
    id: 'elec-4',
    title: 'Pemilihan Dewan Perwakilan Mahasiswa',
    description: 'Pemilihan anggota Dewan Perwakilan Mahasiswa tingkat universitas periode 2025-2026.',
    createdBy: 'Sari Dewi',
    startTime: '2025-05-01T08:00:00',
    endTime: '2025-05-02T17:00:00',
    status: 'closed',
    candidates: [],
    rules: bemRules,
    totalVotes: 245,
    createdAt: '2025-04-01',
  },
];

// --- Audit Logs ---
export const dummyAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'user-2',
    userName: 'Sari Dewi',
    action: 'CREATE',
    description: 'Membuat pemilihan "Pemilihan Ketua BEM 2025/2026"',
    timestamp: '2025-05-01T10:30:00',
    resource: 'Pemilihan',
  },
  {
    id: 'log-2',
    userId: 'user-2',
    userName: 'Sari Dewi',
    action: 'UPDATE',
    description: 'Menambahkan kandidat Ahmad Rizky ke pemilihan BEM',
    timestamp: '2025-05-05T14:20:00',
    resource: 'Kandidat',
  },
  {
    id: 'log-3',
    userId: 'user-2',
    userName: 'Sari Dewi',
    action: 'PUBLISH',
    description: 'Menerbitkan pemilihan "Pemilihan Ketua BEM 2025/2026"',
    timestamp: '2025-05-28T09:00:00',
    resource: 'Pemilihan',
  },
  {
    id: 'log-4',
    userId: 'user-3',
    userName: 'Budi Santoso',
    action: 'VOTE',
    description: 'Memberikan suara pada pemilihan "Pemilihan Ketua BEM 2025/2026"',
    timestamp: '2025-06-01T08:15:00',
    resource: 'Suara',
  },
  {
    id: 'log-5',
    userId: 'user-1',
    userName: 'Andi Prasetyo',
    action: 'LOGIN',
    description: 'Admin Sistem melakukan login ke dashboard',
    timestamp: '2025-06-01T07:00:00',
    resource: 'Sistem',
  },
  {
    id: 'log-6',
    userId: 'user-2',
    userName: 'Sari Dewi',
    action: 'UPDATE',
    description: 'Mengupdate aturan pemilih pada pemilihan "Pemilihan Ketua BEM"',
    timestamp: '2025-05-25T16:45:00',
    resource: 'Aturan',
  },
  {
    id: 'log-7',
    userId: 'user-1',
    userName: 'Andi Prasetyo',
    action: 'CREATE',
    description: 'Menambahkan atribut dinamis "Semester"',
    timestamp: '2025-02-05T09:30:00',
    resource: 'Atribut',
  },
  {
    id: 'log-8',
    userId: 'user-7',
    userName: 'Fajar Rahman',
    action: 'VOTE',
    description: 'Memberikan suara pada pemilihan "Pemilihan Ketua BEM 2025/2026"',
    timestamp: '2025-06-01T10:20:00',
    resource: 'Suara',
  },
  {
    id: 'log-9',
    userId: 'user-6',
    userName: 'Maya Anggraini',
    action: 'CREATE',
    description: 'Membuat pemilihan "Pemilihan Ketua Senat Mahasiswa"',
    timestamp: '2025-07-01T08:00:00',
    resource: 'Pemilihan',
  },
  {
    id: 'log-10',
    userId: 'user-1',
    userName: 'Andi Prasetyo',
    action: 'DELETE',
    description: 'Menghapus pengguna nonaktif dari sistem',
    timestamp: '2025-04-10T13:30:00',
    resource: 'Pengguna',
  },
];

// --- Vote Records ---
export const dummyVoteRecords: VoteRecord[] = [
  { id: 'vr-1', userId: 'user-3', electionId: 'elec-1', candidateId: 'cand-1', timestamp: '2025-06-01T08:15:00' },
  { id: 'vr-2', userId: 'user-7', electionId: 'elec-1', candidateId: 'cand-2', timestamp: '2025-06-01T10:20:00' },
  { id: 'vr-3', userId: 'user-8', electionId: 'elec-1', candidateId: 'cand-1', timestamp: '2025-06-01T11:30:00' },
];

// --- Global Stats ---
export const globalStats = {
  totalUsers: dummyUsers.length,
  totalElections: dummyElections.length,
  totalVotes: dummyElections.reduce((s, e) => s + e.totalVotes, 0),
  activeElections: dummyElections.filter(e => e.status === 'active').length,
  publishedElections: dummyElections.filter(e => e.status === 'published').length,
};
