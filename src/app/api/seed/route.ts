import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import DynamicAttribute from '@/models/DynamicAttribute';
import Candidate from '@/models/Candidate';
import Election from '@/models/Election';
import AuditLog from '@/models/AuditLog';
import SystemSettings from '@/models/SystemSettings';
import VoteRecord from '@/models/VoteRecord';
import UserCategory from '@/models/UserCategory';
import crypto from 'crypto';

export async function POST() {
  try {
    await dbConnect();

    // 1. Clean existing database (FK-safe order: children first)
    await VoteRecord.deleteMany({});
    await Candidate.deleteMany({});
    await AuditLog.deleteMany({});
    await Election.deleteMany({});
    await User.deleteMany({});
    await DynamicAttribute.deleteMany({});
    await SystemSettings.deleteMany({});
    await UserCategory.deleteMany({});

    // 2. Seed User Categories
    const categories = await UserCategory.insertMany([
      { key: 'mahasiswa', label: 'Mahasiswa', description: 'Mahasiswa aktif perguruan tinggi' },
      { key: 'dosen', label: 'Dosen', description: 'Tenaga pengajar/dosen tetap maupun tidak tetap' },
      { key: 'staff', label: 'Staff', description: 'Tenaga kependidikan dan staff administrasi' },
    ]);

    // 3. Seed Dynamic Attributes with category targeting
    const attributes = await DynamicAttribute.insertMany([
      {
        key: 'fakultas',
        label: 'Fakultas',
        type: 'select',
        options: ['Teknik Informatika', 'Ekonomi', 'Hukum', 'Kedokteran', 'FISIP'],
        required: true,
        applicableTo: [], // all categories
      },
      {
        key: 'angkatan',
        label: 'Angkatan',
        type: 'number',
        options: [],
        required: true,
        applicableTo: ['mahasiswa'],
      },
      {
        key: 'jurusan',
        label: 'Jurusan',
        type: 'select',
        options: ['Informatika', 'Sistem Informasi', 'Manajemen', 'Akuntansi', 'Ilmu Hukum', 'Pendidikan Dokter', 'Ilmu Politik'],
        required: true,
        applicableTo: ['mahasiswa'],
      },
      {
        key: 'status_mahasiswa',
        label: 'Status Mahasiswa',
        type: 'select',
        options: ['Aktif', 'Cuti', 'Alumni', 'DO'],
        required: true,
        applicableTo: ['mahasiswa'],
      },
      {
        key: 'semester',
        label: 'Semester',
        type: 'number',
        options: [],
        required: false,
        applicableTo: ['mahasiswa'],
      },
      {
        key: 'nip',
        label: 'NIP',
        type: 'text',
        options: [],
        required: true,
        applicableTo: ['dosen', 'staff'],
      },
      {
        key: 'jabatan',
        label: 'Jabatan',
        type: 'select',
        options: ['Dosen Tetap', 'Dosen Tidak Tetap', 'Lektor', 'Guru Besar', 'Staff Administrasi', 'Staff IT', 'Kepala Bagian'],
        required: false,
        applicableTo: ['dosen', 'staff'],
      },
      {
        key: 'divisi',
        label: 'Divisi',
        type: 'select',
        options: ['Akademik', 'Kemahasiswaan', 'Humas', 'Keuangan', 'IT'],
        required: false,
        applicableTo: ['staff'],
      },
    ]);

    // 4. Seed Users
    const passwordHash = crypto.createHash('sha256').update('password123').digest('hex');
    const users = await User.insertMany([
      {
        name: 'Andi Prasetyo',
        email: 'andi@mudavote.ac.id',
        passwordHash,
        role: 'admin',
        category: 'dosen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        attributes: { fakultas: 'Teknik Informatika', nip: '19850312001', jabatan: 'Dosen Tetap' },
        status: 'active',
      },
      {
        name: 'Sari Dewi',
        email: 'sari@mudavote.ac.id',
        passwordHash,
        role: 'election_admin',
        category: 'staff',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        attributes: { fakultas: 'Teknik Informatika', nip: '20100501002', jabatan: 'Kepala Bagian', divisi: 'Kemahasiswaan' },
        status: 'active',
      },
      {
        name: 'Budi Santoso',
        email: 'budi@mudavote.ac.id',
        passwordHash,
        role: 'voter',
        category: 'mahasiswa',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        attributes: { fakultas: 'Teknik Informatika', jurusan: 'Informatika', angkatan: 2023, status_mahasiswa: 'Aktif', semester: 4 },
        status: 'active',
      },
      {
        name: 'Citra Lestari',
        email: 'citra@mudavote.ac.id',
        passwordHash,
        role: 'voter',
        category: 'mahasiswa',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        attributes: { fakultas: 'Ekonomi', jurusan: 'Manajemen', angkatan: 2022, status_mahasiswa: 'Aktif', semester: 6 },
        status: 'active',
      },
      {
        name: 'Dimas Nugroho',
        email: 'dimas@mudavote.ac.id',
        passwordHash,
        role: 'voter',
        category: 'mahasiswa',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        attributes: { fakultas: 'Teknik Informatika', jurusan: 'Sistem Informasi', angkatan: 2022, status_mahasiswa: 'Cuti', semester: 6 },
        status: 'active',
      }
    ]);

    // 5. Create Elections FIRST (without candidates array)
    const election1 = await Election.create({
      title: 'Pemilihan Ketua BEM 2025',
      description: 'Pemilihan Raya untuk menentukan Ketua dan Wakil Ketua Badan Eksekutif Mahasiswa tingkat Universitas.',
      createdBy: 'Andi Prasetyo',
      startTime: new Date('2025-06-01T08:00:00Z'),
      endTime: new Date('2025-07-30T17:00:00Z'),
      status: 'active',
      candidates: [],
      rules: {
        logic: 'AND',
        conditions: [
          { id: 'rc-1', field: 'status_mahasiswa', operator: '=', value: 'Aktif' }
        ],
        groups: []
      },
      totalVotes: 243,
    });

    const election2 = await Election.create({
      title: 'Pemilihan Ketua HIMA Informatika 2025',
      description: 'Pemilihan Ketua Himpunan Mahasiswa Jurusan Teknik Informatika periode bakti 2025/2026.',
      createdBy: 'Sari Dewi',
      startTime: new Date('2025-06-15T08:00:00Z'),
      endTime: new Date('2025-07-25T17:00:00Z'),
      status: 'active',
      candidates: [],
      rules: {
        logic: 'AND',
        conditions: [
          { id: 'rc-2', field: 'status_mahasiswa', operator: '=', value: 'Aktif' },
          { id: 'rc-3', field: 'jurusan', operator: '=', value: 'Informatika' }
        ],
        groups: []
      },
      totalVotes: 77,
    });

    // 6. Create Candidates AFTER elections exist
    const cand1 = await Candidate.create({
      name: 'Rian & Nia',
      description: 'Visi: Mewujudkan BEM UMN yang progresif, inklusif, dan adaptif terhadap perkembangan teknologi.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
      electionId: election1._id,
      voteCount: 145,
    });

    const cand2 = await Candidate.create({
      name: 'Eko & Rina',
      description: 'Visi: Mengembangkan potensi mahasiswa melalui program sinergi industri dan pemberdayaan softskill.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      electionId: election1._id,
      voteCount: 98,
    });

    const cand3 = await Candidate.create({
      name: 'Gita Amalia',
      description: 'Visi: Menjadikan HIMA Informatika sebagai wadah kolaborasi riset dan pengembangan minat teknologi.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      electionId: election2._id,
      voteCount: 42,
    });

    const cand4 = await Candidate.create({
      name: 'Feri Irawan',
      description: 'Visi: Meningkatkan keahlian praktikal mahasiswa informatika melalui kurikulum bootcamp mandiri.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      electionId: election2._id,
      voteCount: 35,
    });

    // 7. Update Elections with candidate IDs
    await Election.findByIdAndUpdate(election1._id, { candidates: [cand1._id, cand2._id] });
    await Election.findByIdAndUpdate(election2._id, { candidates: [cand3._id, cand4._id] });

    const elections = [election1, election2];

    // 7. Seed Audit Logs
    await AuditLog.insertMany([
      {
        userId: users[0]._id.toString(),
        userName: users[0].name,
        action: 'LOGIN',
        description: 'Administrator masuk ke panel sistem',
        resource: 'AUTH',
      },
      {
        userId: users[0]._id.toString(),
        userName: users[0].name,
        action: 'CREATE',
        description: 'Membuat Pemilihan baru: Pemilihan Ketua BEM 2025',
        resource: 'ELECTION',
      },
      {
        userId: users[1]._id.toString(),
        userName: users[1].name,
        action: 'PUBLISH',
        description: 'Menerbitkan pemilihan HIMA Informatika',
        resource: 'ELECTION',
      }
    ]);

    // 8. Seed System Settings
    const settings = await SystemSettings.create({
      appName: 'MudaVote',
      tagline: 'Platform E-Voting Organisasi Modern',
      defaultLanguage: 'id',
      timezone: 'Asia/Jakarta',
      emailNotification: true,
      autoClose: true,
      maintenanceMode: false,
      maxCandidates: 10,
      minVoterThreshold: 50,
      primaryColor: '#4f46e5',
      logoUrl: '',
      faviconUrl: '',
    });

    return NextResponse.json({
      success: true,
      message: 'Database berhasil di-seed dengan data awal!',
      data: {
        categoriesCount: categories.length,
        attributesCount: attributes.length,
        usersCount: users.length,
        candidatesCount: 4,
        electionsCount: elections.length,
        settings: settings.appName,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Gagal melakukan seed database',
      error: error.message || error
    }, { status: 500 });
  }
}
