'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, Button } from '@/components/ui';
import { PieChart, BarChart } from '@/components/ui/Charts';
import ElectionReportModal from '@/components/ui/ElectionReportModal';

export default function Results() {
  const [elections, setElections] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrintElection, setSelectedPrintElection] = useState<any>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);

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

  const handleOpenPrint = (election: any) => {
    window.open(`/report/${election._id}`, '_blank');
  };

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
            
            const sorted = [...electionCandidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
            const maxVotes = sorted.length > 0 ? (sorted[0].voteCount || 0) : 0;
            const topTied = sorted.filter(c => (c.voteCount || 0) === maxVotes);
            const isTie = totalVotes > 0 && topTied.length > 1;
            const isZeroVotes = totalVotes === 0;
            const isInvalid = isZeroVotes || isTie;
            
            return (
              <Card key={election._id} className="space-y-6">
                <div className="flex flex-wrap justify-between items-start gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {isZeroVotes ? (
                        <Badge color="red">TIDAK SAH (0 Suara)</Badge>
                      ) : isTie ? (
                        <Badge color="red">TIDAK SAH (Hasil Imbang)</Badge>
                      ) : (
                        <Badge color="gray">Selesai (Sah)</Badge>
                      )}
                      <Button variant="secondary" size="sm" onClick={() => handleOpenPrint(election)} icon={
                        <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      }>
                        Cetak PDF Laporan
                      </Button>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{election.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">Selesai pada: {new Date(election.endTime).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isInvalid ? 'text-red-600' : 'text-slate-900'}`}>{totalVotes.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Total Suara Masuk</p>
                  </div>
                </div>

                {!isInvalid ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                    <div className="flex justify-center py-2">
                      <PieChart data={electionCandidates.map(c => ({ label: c.name, value: c.voteCount || 0 }))} />
                    </div>
                    <div className="py-2">
                      <BarChart data={electionCandidates.map(c => ({ label: c.name, value: c.voteCount || 0 }))} />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                    <span className="text-xs font-black text-red-700 uppercase tracking-wider block mb-1">
                      ⚠️ PEMILIHAN TIDAK SAH ({isZeroVotes ? '0 SUARA' : 'HASIL IMBANG / SERI'})
                    </span>
                    <p className="text-xs text-red-600">
                      {isZeroVotes
                        ? 'Tidak ada suara yang masuk selama periode pemungutan suara (0 Suara). Pemilihan ini dinyatakan Batal / Tidak Sah.'
                        : `Perolehan suara teratas bernilai imbang (${maxVotes} suara). Pemilihan ini dinyatakan Tidak Sah / Seri dan tidak ada pemenang tunggal.`}
                    </p>
                  </div>
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

      {selectedPrintElection && (
        <ElectionReportModal
          open={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
          election={selectedPrintElection}
          candidates={candidates}
        />
      )}
    </div>
  );
}

