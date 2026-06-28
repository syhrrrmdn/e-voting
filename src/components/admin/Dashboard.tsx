'use client';
import React, { useEffect, useState } from 'react';
import { StatsCard, Card, PageHeader, Badge } from '@/components/ui';
import { BarChart } from '@/components/ui/Charts';

export default function AdminDashboard({ onNavigate }: { onNavigate?: (p: string) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, electionsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/elections'),
      ]);

      const statsJson = await statsRes.json();
      const electionsJson = await electionsRes.json();

      if (statsJson.success) {
        setStats(statsJson.data);
      }
      if (electionsJson.success) {
        setElections(electionsJson.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data dashboard:', err);
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

  const s = stats || {
    totalUsers: 0,
    totalElections: 0,
    activeElections: 0,
    totalVotes: 0,
    recentLogs: [],
    electionsByStatus: {},
    usersByRole: {}
  };

  const electionsWithVotes = elections.filter(e => e.totalVotes > 0);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Ikhtisar seluruh aktivitas sistem e-voting" />
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard title="Total Pengguna" value={s.totalUsers.toLocaleString()} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} trend="12.5%" trendUp color="indigo" index={0} onClick={() => onNavigate?.('users')} />
        <StatsCard title="Total Pemilihan" value={s.totalElections} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} subtitle={`${s.activeElections} aktif`} color="emerald" index={1} onClick={() => onNavigate?.('elections')} />
        <StatsCard title="Pemilihan Aktif" value={s.activeElections} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} color="amber" index={2} onClick={() => onNavigate?.('elections')} />
        <StatsCard title="Total Suara Masuk" value={s.totalVotes.toLocaleString()} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>} trend="8.3%" trendUp color="blue" index={3} onClick={() => onNavigate?.('elections')} />
      </div>

      {/* Charts & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Suara per Pemilihan</h3>
          {electionsWithVotes.length > 0 ? (
            <BarChart data={electionsWithVotes.map(e => ({ label: e.title.split(' ').slice(0, 3).join(' '), value: e.totalVotes }))} />
          ) : (
            <p className="text-slate-400 text-center py-12 text-sm">Belum ada suara masuk di pemilihan manapun.</p>
          )}
        </Card>
        <Card>
          <h3 className="text-base font-semibold text-slate-900 mb-4">Pemilihan berdasarkan Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Aktif', count: s.electionsByStatus.active || 0, color: 'bg-emerald-500', pct: s.totalElections ? ((s.electionsByStatus.active || 0) / s.totalElections) * 100 : 0 },
              { label: 'Diterbitkan', count: s.electionsByStatus.published || 0, color: 'bg-indigo-500', pct: s.totalElections ? ((s.electionsByStatus.published || 0) / s.totalElections) * 100 : 0 },
              { label: 'Draf', count: s.electionsByStatus.draft || 0, color: 'bg-amber-500', pct: s.totalElections ? ((s.electionsByStatus.draft || 0) / s.totalElections) * 100 : 0 },
              { label: 'Selesai', count: s.electionsByStatus.closed || 0, color: 'bg-slate-400', pct: s.totalElections ? ((s.electionsByStatus.closed || 0) / s.totalElections) * 100 : 0 },
            ].map((statusItem) => (
              <div key={statusItem.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">{statusItem.label}</span>
                  <span className="font-semibold text-slate-900">{statusItem.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${statusItem.color} rounded-full transition-all duration-700`} style={{ width: `${statusItem.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Aktivitas Sistem Terbaru</h3>
          {onNavigate && (
            <button 
              onClick={() => onNavigate('audit')} 
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          )}
        </div>
        <div className="space-y-3">
          {s.recentLogs.length > 0 ? (
            s.recentLogs.slice(0, 6).map((log: any) => (
              <div key={log._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-600' :
                  log.action === 'UPDATE' ? 'bg-blue-100 text-blue-600' :
                  log.action === 'DELETE' ? 'bg-red-100 text-red-600' :
                  log.action === 'VOTE' ? 'bg-indigo-100 text-indigo-600' :
                  log.action === 'LOGIN' ? 'bg-cyan-100 text-cyan-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{log.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{log.userName}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleDateString('id-ID')}</span>
                    <Badge color={log.action==='CREATE'?'green':log.action==='DELETE'?'red':log.action==='VOTE'?'indigo':log.action==='LOGIN'?'cyan':'blue'}>{log.action}</Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-6 text-sm">Tidak ada aktivitas sistem terbaru.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
