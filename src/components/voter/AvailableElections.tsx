'use client';
import React from 'react';
import { PageHeader, Card, Badge, Button } from '@/components/ui';
import { dummyElections } from '@/data/dummy';

export default function AvailableElections({ onSelectElection, onNavigate }: { 
  onSelectElection: (id: string) => void;
  onNavigate: (page: string) => void;
}) {
  // Simulating user data:
  // Status: Aktif, Fakultas: Teknik Informatika, Angkatan: 2022
  const elections = dummyElections.map(e => {
    let eligible = true;
    let reason = '';

    if (e.id === 'elec-1') {
      eligible = true; // status: Aktif, angkatan: 2022, TI
    } else if (e.id === 'elec-2') {
      eligible = true; // status: Aktif
    } else if (e.id === 'elec-4') {
      eligible = false;
      reason = 'Pemilihan sudah berakhir';
    } else {
      eligible = false;
      reason = 'Bukan lingkup Instansi / Angkatan Anda';
    }

    return { ...e, eligible, reason };
  });

  const handleVoteClick = (id: string) => {
    onSelectElection(id);
    onNavigate('voting');
  };

  const handleResultClick = (id: string) => {
    onSelectElection(id);
    onNavigate('results');
  };

  return (
    <div>
      <PageHeader 
        title="Daftar Pemilihan" 
        subtitle="Lihat semua pemilihan yang aktif, terjadwal, maupun selesai" 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {elections.map((e) => (
          <Card key={e.id} className="flex flex-col justify-between h-full relative">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge color={e.status === 'active' ? 'green' : e.status === 'published' ? 'indigo' : 'gray'}>
                  {e.status === 'active' ? 'Aktif Berjalan' : e.status === 'published' ? 'Akan Datang' : 'Selesai'}
                </Badge>
                
                {e.status === 'active' && (
                  <Badge color={e.eligible ? 'green' : 'red'} dot>
                    {e.eligible ? 'Memenuhi Syarat' : 'Tidak Memenuhi Syarat'}
                  </Badge>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">{e.title}</h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-3">{e.description}</p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Mulai: {new Date(e.startTime).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Selesai: {new Date(e.endTime).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-between mt-auto">
              {!e.eligible && e.status === 'active' ? (
                <span className="text-xs text-red-500 font-medium italic">{e.reason}</span>
              ) : (
                <span className="text-xs text-slate-400 font-semibold">{e.totalVotes} Suara Terdaftar</span>
              )}

              {e.status === 'active' && (
                <Button 
                  size="sm" 
                  disabled={!e.eligible}
                  onClick={() => handleVoteClick(e.id)}
                >
                  Buka Bilik Suara
                </Button>
              )}

              {e.status === 'closed' && (
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => handleResultClick(e.id)}
                >
                  Lihat Hasil
                </Button>
              )}

              {e.status === 'published' && (
                <Button 
                  size="sm" 
                  variant="secondary"
                  disabled
                >
                  Belum Dimulai
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
