'use client';
import React, { useEffect, useState } from 'react';
import { StatsCard, Card, PageHeader, Badge } from '@/components/ui';
import { BarChart, PieChart } from '@/components/ui/Charts';

export default function ElectionAdminDashboard({ onNavigate, onSelectElection }: { onNavigate?: (p: string) => void; onSelectElection?: (id: string) => void }) {
  const [elections, setElections] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/elections');
      const json = await res.json();
      if (json.success && json.data) {
        setElections(json.data);
        
        // Fetch candidates for all elections
        const candRes = await fetch('/api/candidates');
        const candJson = await candRes.json();
        if (candJson.success && candJson.data) {
          setCandidates(candJson.data);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data dashboard pemilihan:', err);
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
        <p className="text-sm font-medium">Memuat data dashboard...</p>
      </div>
    );
  }

  const totalVotes = elections.reduce((s, e) => s + (e.totalVotes || 0), 0);
  const activeElectionsCount = elections.filter(e => e.status === 'active').length;
  
  // Find candidates of the first active election or first election to show charts
  const chartElection = elections.find(e => e.status === 'active') || elections[0];
  const chartCandidates = chartElection ? candidates.filter(c => c.electionId === chartElection._id) : [];

  return (
    <div>
      <PageHeader title="Dashboard Pemilihan" subtitle="Ikhtisar pemilihan yang Anda kelola" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard title="Pemilihan Dikelola" value={elections.length} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} color="indigo" index={0} onClick={() => onNavigate?.('elections')} />
        <StatsCard title="Total Kandidat" value={candidates.length} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} color="emerald" index={1} onClick={() => onNavigate?.('candidates')} />
        <StatsCard title="Total Suara" value={totalVotes.toLocaleString()} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>} trend="15.2%" trendUp color="blue" index={2} onClick={() => onNavigate?.('results')} />
        <StatsCard title="Pemilihan Aktif" value={activeElectionsCount} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} color="amber" index={3} onClick={() => onNavigate?.('elections')} />
      </div>

      {chartElection && chartCandidates.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h3 className="text-base font-semibold text-slate-900 mb-4">Distribusi Suara - {chartElection.title}</h3>
            <PieChart data={chartCandidates.map(c => ({ label: c.name, value: c.voteCount || 0 }))} />
          </Card>
          <Card>
            <h3 className="text-base font-semibold text-slate-900 mb-4">Suara per Kandidat - {chartElection.title}</h3>
            <BarChart data={chartCandidates.map(c => ({ label: c.name, value: c.voteCount || 0 }))} />
          </Card>
        </div>
      ) : (
        <Card className="mb-8 text-center text-slate-400 py-12">
          <p className="text-sm">Belum ada data pemilihan aktif dengan kandidat untuk menampilkan grafik.</p>
        </Card>
      )}

      <Card>
        <h3 className="text-base font-semibold text-slate-900 mb-4">Pemilihan Anda</h3>
        {elections.length > 0 ? (
          <div className="space-y-3">
            {elections.map(e => (
              <div 
                key={e._id} 
                onClick={() => {
                  onSelectElection?.(e._id);
                  onNavigate?.(e.status === 'draft' ? 'elections' : 'results');
                }}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-medium text-slate-900">{e.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(e.startTime).toLocaleDateString('id-ID')} - {new Date(e.endTime).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">{e.totalVotes || 0} suara</span>
                  <Badge color={e.status==='active'?'green':e.status==='published'?'indigo':e.status==='draft'?'yellow':'gray'} dot>{e.status==='active'?'Aktif':e.status==='published'?'Diterbitkan':e.status==='draft'?'Draf':'Ditutup'}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-6 text-sm">Belum ada pemilihan yang dibuat.</p>
        )}
      </Card>
    </div>
  );
}
