'use client';
import React from 'react';
import { StatsCard, Card, PageHeader, Badge } from '@/components/ui';
import { BarChart, PieChart } from '@/components/ui/Charts';
import { dummyElections, dummyCandidates } from '@/data/dummy';

export default function ElectionAdminDashboard({ onNavigate, onSelectElection }: { onNavigate?: (p: string) => void; onSelectElection?: (id: string) => void }) {
  const elections = dummyElections.filter(e => e.instansiId === 'inst-1');
  const totalVotes = elections.reduce((s, e) => s + e.totalVotes, 0);
  return (
    <div>
      <PageHeader title="Dashboard Election" subtitle="Overview pemilihan yang Anda kelola" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard title="Elections Dikelola" value={elections.length} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} color="indigo" index={0} onClick={() => onNavigate?.('elections')} />
        <StatsCard title="Total Kandidat" value={dummyCandidates.length} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} color="emerald" index={1} onClick={() => onNavigate?.('candidates')} />
        <StatsCard title="Total Suara" value={totalVotes.toLocaleString()} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>} trend="15.2%" trendUp color="blue" index={2} onClick={() => onNavigate?.('results')} />
        <StatsCard title="Election Aktif" value={elections.filter(e => e.status === 'active').length} icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} color="amber" index={3} onClick={() => onNavigate?.('elections')} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-base font-semibold text-slate-900 mb-4">Distribusi Suara - BEM</h3>
          <PieChart data={dummyCandidates.filter(c => c.electionId === 'elec-1').map(c => ({ label: c.name, value: c.voteCount }))} />
        </Card>
        <Card>
          <h3 className="text-base font-semibold text-slate-900 mb-4">Suara per Kandidat</h3>
          <BarChart data={dummyCandidates.filter(c => c.electionId === 'elec-1').map(c => ({ label: c.name, value: c.voteCount }))} />
        </Card>
      </div>
      <Card>
        <h3 className="text-base font-semibold text-slate-900 mb-4">Elections Anda</h3>
        <div className="space-y-3">
          {elections.map(e => (
            <div 
              key={e.id} 
              onClick={() => {
                onSelectElection?.(e.id);
                onNavigate?.(e.status === 'draft' ? 'elections' : 'results');
              }}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div>
                <p className="font-medium text-slate-900">{e.title}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(e.startTime).toLocaleDateString('id-ID')} - {new Date(e.endTime).toLocaleDateString('id-ID')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">{e.totalVotes} votes</span>
                <Badge color={e.status==='active'?'green':e.status==='published'?'indigo':e.status==='draft'?'yellow':'gray'} dot>{e.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
