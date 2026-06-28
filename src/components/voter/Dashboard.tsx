'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, Button, StatsCard } from '@/components/ui';
import { useSession } from 'next-auth/react';
import { checkEligibility } from '@/lib/ruleEngine';

export default function VoterDashboard({ onNavigate, onSelectElection }: { onNavigate: (page: string) => void; onSelectElection: (id: string) => void }) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [elections, setElections] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, electionsRes, votesRes, settingsRes] = await Promise.all([
        fetch('/api/me'),
        fetch('/api/elections'),
        fetch('/api/vote'),
        fetch('/api/settings')
      ]);

      const profileJson = await profileRes.json();
      const electionsJson = await electionsRes.json();
      const votesJson = await votesRes.json();
      const settingsJson = await settingsRes.json();

      if (profileJson.success && profileJson.data) {
        setProfile(profileJson.data);
      }
      if (electionsJson.success && electionsJson.data) {
        setElections(electionsJson.data);
      }
      if (votesJson.success && votesJson.data) {
        setVotes(votesJson.data);
      }
      if (settingsJson.success && settingsJson.data) {
        setSettings(settingsJson.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data dashboard pemilih:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin mb-3" />
        <p className="text-sm font-medium">Memuat data pemilih...</p>
      </div>
    );
  }

  const user = profile || {
    name: session?.user?.name || 'User',
    email: session?.user?.email || '',
    category: '',
    attributes: {}
  };

  const userAttributes = {
    'Fakultas': user.attributes?.fakultas || '-',
    'Jurusan': user.attributes?.jurusan || '-',
    'Angkatan': user.attributes?.angkatan || '-',
    'Status Mahasiswa': user.attributes?.status_mahasiswa || '-',
    'Semester': user.attributes?.semester || '-'
  };

  // Filter elections targeting the user's attributes (based on rules engine)
  const categoryFilteredElections = elections.filter(e => {
    return checkEligibility({ category: user.category, ...(user.attributes || {}) }, e.rules);
  });

  // Filter active elections
  const activeElections = categoryFilteredElections.filter(e => e.status === 'active');
  const finishedElections = categoryFilteredElections.filter(e => e.status === 'closed');

  const participationText = `${votes.length} / ${activeElections.length + finishedElections.length}`;
  const appName = settings?.appName || 'MudaVote';

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Selamat Datang Kembali, ${user.name}!`} 
        subtitle={`Platform E-Voting ${appName}`} 
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
          value={participationText} 
          subtitle="Pemilihan yang sudah diikuti"
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
          value={user.status === 'active' ? 'MEMENUHI SYARAT' : 'TIDAK AKTIF'} 
          subtitle="Status verifikasi data mahasiswa"
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
              {activeElections.length > 0 ? (
                activeElections.map(e => {
                  const hasVoted = votes.some(v => v.electionId === e._id);
                  
                  return (
                    <div key={e._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors">
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
                          {hasVoted ? (
                            <span className="font-semibold text-blue-600">Sudah Memilih</span>
                          ) : (
                            <span className="font-semibold text-emerald-600">Memenuhi Syarat</span>
                          )}
                        </div>
                      </div>
                      {hasVoted ? (
                        <Button size="sm" variant="secondary" onClick={() => { onSelectElection(e._id); onNavigate('results'); }}>Lihat Hasil</Button>
                      ) : (
                        <Button size="sm" onClick={() => { onSelectElection(e._id); onNavigate('voting'); }}>Mulai Voting</Button>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-center py-6 text-sm">Tidak ada pemilihan aktif saat ini.</p>
              )}
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
