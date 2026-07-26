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
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    await dbConnect();
    const supabaseAdmin = createSupabaseAdminClient();

    // 1. Clean existing database (FK-safe order: children first)
    await VoteRecord.deleteMany({});
    await Candidate.deleteMany({});
    await AuditLog.deleteMany({});
    await Election.deleteMany({});
    await User.deleteMany({});
    await DynamicAttribute.deleteMany({});
    await SystemSettings.deleteMany({});
    await UserCategory.deleteMany({});

    // 2. Seed Default User Categories (Required for system configuration)
    const categories = await UserCategory.insertMany([
      { key: 'mahasiswa', label: 'Mahasiswa', description: 'Mahasiswa aktif perguruan tinggi' },
      { key: 'dosen', label: 'Dosen', description: 'Tenaga pengajar/dosen tetap maupun tidak tetap' },
      { key: 'staff', label: 'Staff', description: 'Tenaga kependidikan dan staff administrasi' },
    ]);

    // 3. Seed Default Dynamic Attributes
    const attributes = await DynamicAttribute.insertMany([
      {
        key: 'jurusan',
        label: 'Jurusan',
        type: 'select',
        options: ['bisnis dan Informatika', 'mesin', 'sipil', 'pariwisata', 'pertanian'],
        required: true,
        applicableTo: [],
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
        key: 'program_studi',
        label: 'Program Studi',
        type: 'select',
        options: [
          'Teknik Sipil',
          'Teknologi Rekayasa Konstruksi Jalan dan Jembatan',
          'Teknologi Rekayasa Konstruksi Bangunan Gedung',
          'Manajemen Konstruksi',
          'Teknologi Rekayasa Manufaktur',
          'Teknik Manufaktur Kapal',
          'Teknologi Rekayasa Perangkat Lunak',
          'Teknologi Rekayasa Komputer',
          'Bisnis Digital',
          'Manajemen Bisnis Pariwisata',
          'Destinasi Pariwisata',
          'Pengelolaan Perhotelan',
          'Agribisnis',
          'Teknologi Pengolahan Hasil Ternak',
          'Pengembangan Produk Agroindustri',
          'Teknologi Budi Daya Perikanan / Teknologi Akuakultur',
          'Teknologi Produksi Tanaman Pangan',
          'Teknologi Produksi Ternak',
          'Teknologi Rekayasa Otomotif',
        ],
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
        key: 'nip',
        label: 'NIP',
        type: 'text',
        options: [],
        required: true,
        applicableTo: ['dosen', 'staff'],
      },
    ]);

    // 4. Create admin in Supabase Auth + local User table
    const adminEmail = 'admin@gmail.com';
    const adminPassword = '123456';

    // Create in Supabase Auth (delete existing if any)
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAdmin = existingUsers?.users?.find((u: any) => u.email === adminEmail);
    if (existingAdmin) {
      await supabaseAdmin.auth.admin.deleteUser(existingAdmin.id);
    }

    await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: 'Admin Sistem', role: 'admin' },
    });

    // Create in local User table
    const adminUser = await User.create({
      name: 'Admin Sistem',
      email: adminEmail,
      passwordHash: 'supabase_auth_managed',
      role: 'admin',
      category: 'dosen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      attributes: { fakultas: 'Teknik Informatika', nip: '19850312001' },
      status: 'active',
    });

    // 5. Seed System Settings (faviconUrl is just a plain URL string)
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

    // 6. Log Audit for Initial Setup
    await AuditLog.create({
      userId: adminUser._id.toString(),
      userName: adminUser.name,
      action: 'SYSTEM_RESET',
      description: 'Sistem di-reset. Seluruh data pemilihan dan pengguna dibersihkan. Hanya tersisa akun Admin Sistem.',
      resource: 'SYSTEM',
    });

    return NextResponse.json({
      success: true,
      message: 'Database berhasil dibersihkan! Hanya tersisa 1 akun Admin Sistem.',
      data: {
        adminAccount: {
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          defaultPassword: adminPassword,
        },
        electionsCount: 0,
        candidatesCount: 0,
        voteRecordsCount: 0,
        usersCount: 1,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Gagal membersihkan database',
      error: error.message || error
    }, { status: 500 });
  }
}
