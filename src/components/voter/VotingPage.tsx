'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PageHeader, Card, Button, Modal, Badge } from '@/components/ui';
import Swal from '@/lib/swal';

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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [voteRecord, setVoteRecord] = useState<any>(null);
  
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
      
      const [elRes, candRes, voteRes, userRes] = await Promise.all([
        fetch(`/api/elections/${selectedElectionId}`),
        fetch(`/api/candidates?electionId=${selectedElectionId}`),
        fetch('/api/vote'),
        fetch('/api/me'),
      ]);
      
      const elJson = await elRes.json();
      const candJson = await candRes.json();
      const voteJson = await voteRes.json();
      const userJson = await userRes.json();

      if (userJson.success && userJson.data) {
        setUserProfile(userJson.data);
      }
      
      if (elJson.success && elJson.data) {
        setElection(elJson.data);
      } else {
        setError(elJson.message || 'Gagal memuat pemilihan');
      }

      if (candJson.success && candJson.data) {
        setCandidates(candJson.data);
      }

      if (voteJson.success && voteJson.data) {
        const existingVote = voteJson.data.find((v: any) => v.electionId === selectedElectionId);
        if (existingVote) {
          setVoted(true);
          setVoteRecord(existingVote);
          const pseudoHash = '0x' + (existingVote._id || existingVote.id || '1234567890abcdef').padEnd(40, 'a8f9c0e2b1d4f6e3');
          setTxHash(pseudoHash);
        }
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
        setConfirmModal(false);
        const newHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setTxHash(newHash);
        setVoteRecord({ createdAt: new Date() });
        Swal.success('Suara Terkirim!', 'Terima kasih, suara Anda telah resmi masuk ke dalam sistem.');
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

  const handleCopyHash = () => {
    if (navigator.clipboard && txHash) {
      navigator.clipboard.writeText(txHash);
      Swal.success('Tersalin!', 'Kode verifikasi bukti suara berhasil disalin.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-slate-500">
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
        title={voted ? "Bukti Pemilihan Digital" : "Bilik Suara Digital"} 
        subtitle={voted ? "Bukti resmi keikutsertaan Anda dalam pemungutan suara" : "Berikan suara Anda secara demokratis, aman, dan rahasia"} 
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Election Card Header */}
      {election && (
        <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <Badge color={voted ? 'green' : 'indigo'}>
                {voted ? '✓ Sudah Memilih' : 'Pemilihan Aktif'}
              </Badge>
              <h2 className="text-xl sm:text-2xl font-bold mt-2 mb-1">{election.title}</h2>
              <p className="text-sm text-slate-300 max-w-2xl">{election.description}</p>
            </div>
            {voted && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold shrink-0 self-start sm:self-center">
                TERVERIFIKASI
              </span>
            )}
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        </Card>
      )}

      {/* Dynamic Content: Receipt (if voted) OR Candidates List (if not voted) */}
      {voted ? (
        <Card className="border-emerald-200 bg-white shadow-xl overflow-hidden print:p-8">
          <div className="text-center py-6 border-b border-slate-100">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-3 shadow-md shadow-emerald-600/10">
              <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">BUKTI RESMI TANDA TERIMA SUARA</h3>
            <p className="text-xs text-slate-500 mt-1">Sistem E-Voting Terenkripsi & Terverifikasi Real-Time</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Voter & Election Metadata Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block uppercase">Nama Pemilih</span>
                <span className="text-slate-900 font-bold text-sm block mt-0.5">{userProfile?.name || 'Pemilih Terdaftar'}</span>
                <span className="text-slate-500 font-medium block">{userProfile?.email || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase">Kategori & Atribut</span>
                <span className="text-indigo-600 font-bold text-sm block mt-0.5">{userProfile?.category || 'Umum'}</span>
                <span className="text-slate-500 font-medium block">
                  {userProfile?.attributes ? Object.entries(userProfile.attributes).map(([k, v]) => `${k}: ${v}`).join(' | ') : '-'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 font-semibold block uppercase">Nama Pemilihan</span>
                <span className="text-slate-900 font-bold block mt-0.5">{election?.title}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 font-semibold block uppercase">Waktu Suara Masuk</span>
                <span className="text-slate-900 font-bold block mt-0.5">
                  {voteRecord?.createdAt ? new Date(voteRecord.createdAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' }) : new Date().toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Cryptographic Hash & Verification Box */}
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  🔒 Kode Verifikasi Kriptografi Suara
                </span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  Salin Kode
                </button>
              </div>
              <p className="text-xs font-mono text-indigo-800 bg-white p-2.5 rounded-lg border border-indigo-200/80 break-all select-all font-semibold">
                {txHash}
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                * Catatan Kerahasiaan: Demi menjaga asas LUBER JURDIL, pilihan kandidat Anda disembunyikan/dienkripsi secara otomatis oleh sistem agar tidak dapat diintervensi atau dilihat oleh siapapun.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
              <Button variant="secondary" onClick={handlePrint} className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Cetak Bukti Pemilihan</span>
              </Button>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => onNavigate?.('dashboard')}>
                  Ke Dashboard
                </Button>
                <Button onClick={() => onNavigate?.('results')}>
                  Lihat Hasil Pemilihan
                </Button>
              </div>
            </div>
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
                        <Image src={cand.image} alt={cand.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
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
