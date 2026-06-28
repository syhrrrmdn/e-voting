import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import DynamicAttribute from '@/models/DynamicAttribute';
import Candidate from '@/models/Candidate';
import Election from '@/models/Election';
import AuditLog from '@/models/AuditLog';
import SystemSettings from '@/models/SystemSettings';
import VoteRecord from '@/models/VoteRecord';
import UserCategory from '@/models/UserCategory';
import mongoose from 'mongoose';

export async function POST() {
  try {
    await dbConnect();

    // 1. Clean existing database collections
    await Promise.all([
      User.deleteMany({}),
      DynamicAttribute.deleteMany({}),
      Candidate.deleteMany({}),
      Election.deleteMany({}),
      AuditLog.deleteMany({}),
      SystemSettings.deleteMany({}),
      VoteRecord.deleteMany({}),
      UserCategory.deleteMany({}),
    ]);

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

    // 4. Seed Users with category
    const users = await User.insertMany([
      {
        name: 'Andi Prasetyo',
        email: 'andi@mudavote.ac.id',
        role: 'admin',
        category: 'staff',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        attributes: { fakultas: 'Teknik Informatika', nip: '198501012010011001', divisi: 'IT', jabatan: 'Staff IT' },
        status: 'active',
      },
      {
        name: 'Sari Dewi',
        email: 'sari@mudavote.ac.id',
        role: 'election_admin',
        category: 'dosen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        attributes: { fakultas: 'Ekonomi', nip: '199003152015042001', jabatan: 'Dosen Tetap' },
        status: 'active',
      },
      {
        name: 'Budi Santoso',
        email: 'budi@mudavote.ac.id',
        role: 'voter',
        category: 'mahasiswa',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        attributes: { fakultas: 'Teknik Informatika', jurusan: 'Informatika', angkatan: 2023, status_mahasiswa: 'Aktif', semester: 4 },
        status: 'active',
      },
      {
        name: 'Citra Lestari',
        email: 'citra@mudavote.ac.id',
        role: 'voter',
        category: 'mahasiswa',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        attributes: { fakultas: 'Hukum', jurusan: 'Ilmu Hukum', angkatan: 2024, status_mahasiswa: 'Aktif', semester: 2 },
        status: 'active',
      },
      {
        name: 'Dedi Kurniawan',
        email: 'dedi@mudavote.ac.id',
        role: 'voter',
        category: 'mahasiswa',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        attributes: { fakultas: 'Teknik Informatika', jurusan: 'Sistem Informasi', angkatan: 2022, status_mahasiswa: 'Cuti', semester: 6 },
        status: 'active',
      }
    ]);

    // 5. Seed Elections
    const election1Id = new mongoose.Types.ObjectId();
    const election2Id = new mongoose.Types.ObjectId();

    // 6. Seed Candidates
    const cand1 = await Candidate.create({
      name: 'Rian & Nia',
      description: 'Visi: Mewujudkan BEM UMN yang progresif, inklusif, dan adaptif terhadap perkembangan teknologi.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
      electionId: election1Id,
      voteCount: 145,
    });

    const cand2 = await Candidate.create({
      name: 'Eko & Rina',
      description: 'Visi: Mengembangkan potensi mahasiswa melalui program sinergi industri dan pemberdayaan softskill.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      electionId: election1Id,
      voteCount: 98,
    });

    const cand3 = await Candidate.create({
      name: 'Gita Amalia',
      description: 'Visi: Menjadikan HIMA Informatika sebagai wadah kolaborasi riset dan pengembangan minat teknologi.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      electionId: election2Id,
      voteCount: 42,
    });

    const cand4 = await Candidate.create({
      name: 'Feri Irawan',
      description: 'Visi: Meningkatkan keahlian praktikal mahasiswa informatika melalui kurikulum bootcamp mandiri.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      electionId: election2Id,
      voteCount: 35,
    });

    // Save Elections with referenced candidates
    const elections = await Election.insertMany([
      {
        _id: election1Id,
        title: 'Pemilihan Ketua BEM 2025',
        description: 'Pemilihan Raya untuk menentukan Ketua dan Wakil Ketua Badan Eksekutif Mahasiswa tingkat Universitas.',
        createdBy: 'Andi Prasetyo',
        startTime: new Date('2025-06-01T08:00:00Z'),
        endTime: new Date('2025-07-30T17:00:00Z'),
        status: 'active',
        candidates: [cand1._id, cand2._id],
        rules: {
          logic: 'AND',
          conditions: [
            { id: 'rc-1', field: 'status_mahasiswa', operator: '=', value: 'Aktif' }
          ],
          groups: []
        },
        totalVotes: 243,
      },
      {
        _id: election2Id,
        title: 'Pemilihan Ketua HIMA Informatika 2025',
        description: 'Pemilihan Ketua Himpunan Mahasiswa Jurusan Teknik Informatika periode bakti 2025/2026.',
        createdBy: 'Sari Dewi',
        startTime: new Date('2025-06-15T08:00:00Z'),
        endTime: new Date('2025-07-25T17:00:00Z'),
        status: 'active',
        candidates: [cand3._id, cand4._id],
        rules: {
          logic: 'AND',
          conditions: [
            { id: 'rc-2', field: 'status_mahasiswa', operator: '=', value: 'Aktif' },
            { id: 'rc-3', field: 'jurusan', operator: '=', value: 'Informatika' }
          ],
          groups: []
        },
        totalVotes: 77,
      }
    ]);

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
