'use client';
import React from 'react';
import { PageHeader, Card, Badge, Button, StatsCard } from '@/components/ui';
import { dummyElections } from '@/data/dummy';

export default function VoterDashboard({ onNavigate, onSelectElection }: { onNavigate: (page: string) => void; onSelectElection: (id: string) => void }) {
  // Let's assume current user attributes are:
  // status_mahasiswa: 'Aktif', angkatan: 2022, fakultas: 'Teknik Informatika'
  const userAttributes = {
    'Fakultas': 'Teknik Informatika',
    'Angkatan': '2022',
    'Status Mahasiswa': 'Aktif',
    'Semester': '6'
  };

  const activeElections = dummyElections.filter(e => e.status === 'active');
  const finishedElections = dummyElections.filter(e => e.status === 'closed');

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Selamat Datang Kembali, Andi!" 
        subtitle="Sistem E-Voting Multi-Instansi Universitas Muda Nusantara" 
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard 
          title="Pemilihan Aktif" 
          value={activeElections.length} 
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          } 
          color="indigo" 
          onClick={() => onNavigate('elections')}
        />
        <StatsCard 
          title="Partisipasi Anda" 
          value="1 / 2" 
          subtitle="Pemilihan yang sudah Anda ikuti"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          } 
          color="emerald" 
          onClick={() => onNavigate('results')}
        />
        <StatsCard 
          title="Status Akun" 
          value="ELIGIBLE" 
          subtitle="Memenuhi syarat data mahasiswa aktif"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          } 
          color="cyan" 
          onClick={() => onNavigate('profile')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Elections list */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Pemilihan Aktif yang Tersedia</h3>
              <Button size="sm" variant="ghost" onClick={() => onNavigate('elections')}>Lihat Semua</Button>
            </div>
            
            <div className="space-y-4">
              {activeElections.map(e => (
                <div key={e.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-950 text-sm sm:text-base">{e.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{e.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tutup: {new Date(e.endTime).toLocaleDateString('id-ID')}
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-emerald-600">Eligible</span>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => { onSelectElection(e.id); onNavigate('voting'); }}>Mulai Voting</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* User Attributes Profile Summary */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Profil Atribut Anda</h3>
              <button 
                onClick={() => onNavigate('profile')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
              >
                Lihat Lengkap
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">Data atribut Anda di bawah digunakan untuk memvalidasi eligibility pemilih secara real-time.</p>
            <div className="space-y-3">
              {Object.entries(userAttributes).map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 text-sm">
                  <span className="text-slate-500 font-medium">{label}</span>
                  <span className="text-slate-900 font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
