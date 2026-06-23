'use client';
import React from 'react';
import { StatsCard, Card, PageHeader, Badge } from '@/components/ui';
import { BarChart } from '@/components/ui/Charts';
import { globalStats, dummyElections, dummyAuditLogs } from '@/data/dummy';

export default function AdminDashboard({ onNavigate }: { onNavigate?: (p: string) => void }) {
  return (
    <div>
      <PageHeader title="Dashboard Global" subtitle="Overview seluruh aktivitas sistem e-voting" />
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard title="Total Users" value={globalStats.totalUsers.toLocaleString()} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} trend="12.5%" trendUp color="indigo" index={0} onClick={() => onNavigate?.('users')} />
        <StatsCard title="Total Instansi" value={globalStats.totalInstansi} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} trend="2 baru" trendUp color="blue" index={1} onClick={() => onNavigate?.('instansi')} />
        <StatsCard title="Total Elections" value={globalStats.totalElections} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} subtitle={`${globalStats.activeElections} aktif`} color="emerald" index={2} onClick={() => onNavigate?.('elections')} />
        <StatsCard title="Total Votes" value={globalStats.totalVotes.toLocaleString()} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>} trend="8.3%" trendUp color="amber" index={3} onClick={() => onNavigate?.('elections')} />
      </div>
      {/* Charts & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Votes per Election</h3>
          <BarChart data={dummyElections.filter(e => e.totalVotes > 0).map(e => ({ label: e.title.split(' ').slice(0, 3).join(' '), value: e.totalVotes }))} />
        </Card>
        <Card>
          <h3 className="text-base font-semibold text-slate-900 mb-4">Elections by Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Active', count: 1, color: 'bg-emerald-500', pct: 25 },
              { label: 'Published', count: 1, color: 'bg-indigo-500', pct: 25 },
              { label: 'Draft', count: 1, color: 'bg-amber-500', pct: 25 },
              { label: 'Closed', count: 1, color: 'bg-slate-400', pct: 25 },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">{s.label}</span>
                  <span className="font-semibold text-slate-900">{s.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">Aktivitas Terkini</h3>
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
          {dummyAuditLogs.slice(0, 6).map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-600' :
                log.action === 'UPDATE' ? 'bg-blue-100 text-blue-600' :
                log.action === 'DELETE' ? 'bg-red-100 text-red-600' :
                log.action === 'VOTE' ? 'bg-indigo-100 text-indigo-600' :
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
                  <Badge color={log.action==='CREATE'?'green':log.action==='DELETE'?'red':log.action==='VOTE'?'indigo':'blue'}>{log.action}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
