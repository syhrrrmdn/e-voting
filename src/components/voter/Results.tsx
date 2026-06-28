'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge } from '@/components/ui';
import { PieChart, BarChart } from '@/components/ui/Charts';

export default function Results() {
  const [elections, setElections] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
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
        setElections(electionsJson.data);
      }
      if (candidatesJson.success && candidatesJson.data) {
        setCandidates(candidatesJson.data);
      }
    } catch (err) {
      console.error('Gagal mengambil hasil pemilihan:', err);
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
        <p className="text-sm font-medium">Memuat hasil pemilihan...</p>
      </div>
    );
  }

  const closedElections = elections.filter(e => e.status === 'closed');
  const activeElections = elections.filter(e => e.status === 'active');

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Hasil Pemilihan (Read-Only)" 
        subtitle="Lihat hasil akhir pemilu yang telah selesai secara transparan" 
      />

      {closedElections.length === 0 ? (
        <Card className="py-12 flex flex-col items-center justify-center text-slate-400">
          <p className="text-sm">Belum ada pemilihan yang selesai dan ditutup.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {closedElections.map(election => {
            const electionCandidates = candidates.filter(c => c.electionId === election._id);
            const totalVotes = electionCandidates.reduce((s, c) => s + (c.voteCount || 0), 0);
            
            return (
              <Card key={election._id} className="space-y-6">
                <div className="flex flex-wrap justify-between items-start gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <Badge color="gray">Selesai</Badge>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{election.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">Selesai pada: {new Date(election.endTime).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{totalVotes.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Total Suara Masuk</p>
                  </div>
                </div>

                {totalVotes > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                    <div className="flex justify-center py-2">
                      <PieChart data={electionCandidates.map(c => ({ label: c.name, value: c.voteCount || 0 }))} />
                    </div>
                    <div className="py-2">
                      <BarChart data={electionCandidates.map(c => ({ label: c.name, value: c.voteCount || 0 }))} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-6">Tidak ada suara masuk untuk pemilihan ini.</p>
                )}
              </Card>
            );
          })}

          {activeElections.length > 0 && (
            <Card className="border-dashed border-2">
              <h4 className="font-bold text-slate-900 text-base mb-2">Pemilihan Sedang Berlangsung</h4>
              <p className="text-xs text-slate-500 mb-4">
                Hasil realtime untuk pemilihan di bawah ini disembunyikan sampai pemilihan resmi berakhir demi menjaga rahasia suara.
              </p>
              <div className="space-y-2">
                {activeElections.map(e => (
                  <div key={e._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-sm">
                    <span className="font-semibold text-slate-700">{e.title}</span>
                    <Badge color="indigo">Dalam Proses</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
