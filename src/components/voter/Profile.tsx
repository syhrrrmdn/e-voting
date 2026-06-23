'use client';
import React from 'react';
import { PageHeader, Card, Avatar, Badge, Input, Button } from '@/components/ui';

export default function Profile() {
  const user = {
    name: 'Andi Prasetyo',
    email: 'andi@umn.ac.id',
    role: 'voter',
    instansiName: 'Universitas Muda Nusantara',
    attributes: {
      fakultas: 'Teknik Informatika',
      angkatan: 2022,
      status_mahasiswa: 'Aktif',
      semester: 6
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader 
        title="Profil Voter" 
        subtitle="Kelola informasi akun dan tinjau data validasi kriteria pemilih Anda" 
      />

      <Card className="flex flex-col sm:flex-row items-center gap-6">
        <Avatar name={user.name} size="lg" />
        <div className="text-center sm:text-left flex-1 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <Badge color="blue">Voter</Badge>
          </div>
          <p className="text-sm text-slate-500">{user.email}</p>
          <p className="text-xs text-slate-400 font-semibold">{user.instansiName}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dynamic User Attributes */}
        <Card>
          <h3 className="text-base font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3">Atribut Pemilih Anda</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Fakultas</label>
              <Input value={user.attributes.fakultas} disabled />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Angkatan</label>
              <Input value={user.attributes.angkatan.toString()} disabled />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status Mahasiswa</label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={user.attributes.status_mahasiswa} disabled className="flex-1" />
                <Badge color="green" dot>Aktif</Badge>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Semester</label>
              <Input value={user.attributes.semester.toString()} disabled />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            * Data di atas disinkronisasi langsung oleh Administrator Instansi dan bersifat read-only untuk menjaga keabsahan rule eligibility voter engine.
          </p>
        </Card>

        {/* Security & System Info */}
        <Card className="flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3">Keamanan & Sistem</h3>
            <div className="space-y-3">
              <Input label="Password Lama" type="password" placeholder="••••••••" />
              <Input label="Password Baru" type="password" placeholder="Minimal 8 karakter" />
            </div>
            <Button variant="secondary" className="w-full">Update Password</Button>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center text-xs text-slate-400">
            <span>Terdaftar sejak: 15 Jan 2025</span>
            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">Logout</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
