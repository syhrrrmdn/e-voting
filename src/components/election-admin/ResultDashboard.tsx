'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Button, Select, Badge, StatsCard } from '@/components/ui';
import { BarChart, PieChart } from '@/components/ui/Charts';

export default function ResultDashboard() {
  const [elections, setElections] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [electionsRes, candidatesRes] = await Promise.all([
        fetch('/api/elections'),
        fetch('/api/candidates')
      ]);

      const electionsJson = await electionsRes.json();
      const candidatesJson = await candidatesRes.json();

      if (electionsJson.success && electionsJson.data) {
        // Only show elections that are active or closed
        const filteredElections = electionsJson.data.filter((e: any) => e.status !== 'draft');
        setElections(filteredElections);
        if (filteredElections.length > 0) {
          setSelectedElectionId(filteredElections[0]._id);
        }
      }
      if (candidatesJson.success && candidatesJson.data) {
        setCandidates(candidatesJson.data);
      }
    } catch (err) {
      console.error('Gagal memuat hasil pemilihan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedElection = elections.find(e => e._id === selectedElectionId);
  const electionCandidates = selectedElectionId ? candidates.filter(c => c.electionId === selectedElectionId) : [];

  // Compute total votes
  const totalVotes = electionCandidates.reduce((s, c) => s + (c.voteCount || 0), 0);

  // Sort candidates by voteCount descending
  const sortedCandidates = [...electionCandidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

  const handleExport = (format: string) => {
    alert(`Mengekspor hasil pemilihan "${selectedElection?.title}" dalam format ${format}...`);
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin mb-3" />
        <p className="text-sm font-medium">Memuat hasil pemilihan...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Dashboard Hasil" 
        subtitle="Analisis perolehan suara pemilihan realtime" 
        action={
          selectedElection && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleExport('PDF')} icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }>
                Ekspor PDF
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleExport('Excel')} icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }>
                Ekspor Excel
              </Button>
            </div>
          )
        } 
      />

      <Card className="mb-6">
        <div className="max-w-xs">
          <Select 
            label="Pilih Pemilihan" 
            options={elections.map(e => ({ value: e._id, label: e.title }))} 
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(e.target.value)}
          />
        </div>
      </Card>

      {!selectedElection ? (
        <Card className="flex flex-col items-center justify-center py-12 text-slate-400">
          <p className="text-sm">Tidak ada hasil pemilihan yang diterbitkan, aktif atau ditutup.</p>
        </Card>
      ) : selectedElection.status !== 'closed' ? (
        <Card className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Hasil Pemilihan Dikunci</h3>
          <p className="text-sm text-slate-500 max-w-md">
            Pemilihan <strong>"{selectedElection.title}"</strong> saat ini masih berstatus <strong>{selectedElection.status.toUpperCase()}</strong>. Perolehan suara disembunyikan hingga pemilihan resmi ditutup demi menjaga kerahasiaan & integritas suara.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatsCard title="Total Suara Masuk" value={totalVotes.toLocaleString()} icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } color="indigo" />
            <StatsCard title="Partisipasi Pemilih" value="84.2%" trend="Target 80%" trendUp icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            } color="emerald" />
            <StatsCard title="Status Pemilihan" value={selectedElection.status === 'active' ? 'AKTIF' : selectedElection.status === 'published' ? 'DITERBITKAN' : selectedElection.status === 'draft' ? 'DRAF' : 'DITUTUP'} icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } color={selectedElection.status === 'active' ? 'emerald' : selectedElection.status === 'closed' ? 'rose' : 'indigo'} />
          </div>

          {/* Charts */}
          {totalVotes > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider text-slate-400">Distribusi Suara (Pie)</h3>
                <div className="flex justify-center py-4">
                  <PieChart data={electionCandidates.map(c => ({ label: c.name, value: c.voteCount || 0 }))} />
                </div>
              </Card>
              <Card>
                <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider text-slate-400">Distribusi Suara (Bar)</h3>
                <div className="py-4">
                  <BarChart data={electionCandidates.map(c => ({ label: c.name, value: c.voteCount || 0 }))} />
                </div>
              </Card>
            </div>
          ) : (
            <Card className="py-12 flex flex-col items-center justify-center text-slate-400">
              <p className="text-sm">Belum ada suara masuk untuk pemilihan ini.</p>
            </Card>
          )}

          {/* Table Leaderboard */}
          <Card>
            <h3 className="text-base font-semibold text-slate-900 mb-4">Klasemen Perolehan Suara</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500 font-semibold">
                    <th className="py-3 px-4">Posisi</th>
                    <th className="py-3 px-4">Kandidat</th>
                    <th className="py-3 px-4 text-right">Jumlah Suara</th>
                    <th className="py-3 px-4 text-right">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedCandidates.map((cand, idx) => {
                    const pct = totalVotes > 0 ? (((cand.voteCount || 0) / totalVotes) * 100).toFixed(1) : '0';
                    return (
                      <tr key={cand._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-600">
                          {idx + 1 === 1 ? (
                            <Badge color="yellow">🏆 Rank 1</Badge>
                          ) : (
                            `Rank ${idx + 1}`
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{cand.name}</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-700">{(cand.voteCount || 0).toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-semibold text-slate-900">{pct}%</span>
                            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
