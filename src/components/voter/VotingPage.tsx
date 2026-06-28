'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Button, Modal, Badge } from '@/components/ui';

export default function VotingPage({ 
  selectedElectionId,
  onNavigate 
}: { 
  selectedElectionId?: string;
  onNavigate?: (p: string) => void;
}) {
  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [voted, setVoted] = useState(false);
  const [votedCandidate, setVotedCandidate] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const fetchElectionData = async () => {
    if (!selectedElectionId) {
      setError('ID Pemilihan tidak valid');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch(`/api/elections/${selectedElectionId}`);
      const json = await res.json();
      
      if (json.success && json.data) {
        setElection(json.data);
        
        // Load candidates
        const candRes = await fetch(`/api/candidates?electionId=${selectedElectionId}`);
        const candJson = await candRes.json();
        
        if (candJson.success && candJson.data) {
          setCandidates(candJson.data);
        }
      } else {
        setError(json.message || 'Gagal memuat pemilihan');
      }
    } catch (err) {
      setError('Gagal menghubungkan ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElectionData();
  }, [selectedElectionId]);

  const handleSelectCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    setConfirmModal(true);
  };

  const handleConfirmVote = async () => {
    if (!election || !selectedCandidate) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electionId: election._id,
          candidateId: selectedCandidate._id,
        }),
      });
      
      const json = await res.json();
      
      if (json.success) {
        setVoted(true);
        setVotedCandidate(selectedCandidate);
        setConfirmModal(false);
        // Generate random fake transaction hash for demonstration
        setTxHash('0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
      } else {
        setError(json.message || 'Gagal mengirimkan suara Anda');
        setConfirmModal(false);
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan saat mengirimkan suara');
      setConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin mb-3" />
        <p className="text-sm font-medium">Membuka Bilik Suara...</p>
      </div>
    );
  }

  if (error && !election) {
    return (
      <Card className="text-center py-12 border-red-200 bg-red-50/20">
        <p className="text-sm font-semibold text-red-600">{error}</p>
        <Button className="mt-4" size="sm" onClick={() => onNavigate?.('elections')}>Kembali ke Daftar Pemilihan</Button>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Bilik Suara Digital" 
        subtitle="Berikan suara Anda secara demokratis, aman, dan rahasia" 
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {election && (
        <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative overflow-hidden">
          <div className="relative z-10">
            <Badge color="indigo">Pemilihan Aktif</Badge>
            <h2 className="text-xl sm:text-2xl font-bold mt-2 mb-2">{election.title}</h2>
            <p className="text-sm text-slate-300 max-w-2xl">{election.description}</p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        </Card>
      )}

      {voted ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-emerald-200 bg-emerald-50/20">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Suara Anda Berhasil Dikirim!</h3>
          <p className="text-sm text-slate-500 max-w-md mt-2">
            Terima kasih telah berpartisipasi. Anda telah memilih <strong className="text-indigo-600 font-semibold">{votedCandidate?.name}</strong>. Satu suara Anda sangat berarti.
          </p>
          <div className="mt-6 p-4 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-400 mb-6 max-w-full truncate">
            Hash Transaksi: <span className="text-slate-600 font-bold select-all">{txHash}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => onNavigate?.('dashboard')}>Kembali ke Dashboard</Button>
            <Button onClick={() => onNavigate?.('results')}>Lihat Hasil Pemilu</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 text-center">Daftar Kandidat Calon</h3>
          
          {candidates.length === 0 ? (
            <Card className="text-center py-8 text-slate-400">
              Belum ada kandidat untuk pemilihan ini.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {candidates.map((cand, idx) => (
                <Card key={cand._id} className="flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-2 hover:border-indigo-200 group">
                  <div className="text-center">
                    {/* Candidate Number / Badge */}
                    <div className="flex justify-center mb-4">
                      <span className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">
                        0{idx + 1}
                      </span>
                    </div>

                    {/* Candidate Image */}
                    <div className="aspect-[4/3] w-full rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100 relative overflow-hidden">
                      {cand.image ? (
                        <img src={cand.image} alt={cand.name} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5" />
                          <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-base mb-2">{cand.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-3 mb-6">{cand.description}</p>
                  </div>

                  <Button 
                    onClick={() => handleSelectCandidate(cand)}
                    className="w-full mt-auto"
                  >
                    Pilih Kandidat
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        open={confirmModal}
        onClose={() => setConfirmModal(false)}
        title="Konfirmasi Pilihan Anda"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmModal(false)} disabled={submitting}>Batal</Button>
            <Button variant="success" onClick={handleConfirmVote} disabled={submitting}>
              {submitting ? 'Mengirim...' : 'Ya, Kirim Suara'}
            </Button>
          </>
        }
      >
        <div className="text-center p-2">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-3">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h4 className="font-bold text-slate-900 text-base mb-1">Apakah Anda yakin dengan pilihan Anda?</h4>
          <p className="text-sm text-slate-500 mb-4">
            Anda akan memilih <strong>{selectedCandidate?.name}</strong>. Pilihan ini bersifat final dan tidak dapat diubah kembali.
          </p>
        </div>
      </Modal>
    </div>
  );
}
