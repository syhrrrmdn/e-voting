'use client';
import React, { useState } from 'react';
import { PageHeader, Card, Button, Modal, Badge } from '@/components/ui';
import { dummyElections, dummyCandidates } from '@/data/dummy';
import type { Candidate } from '@/types';

export default function VotingPage({ 
  selectedElectionId,
  onNavigate 
}: { 
  selectedElectionId?: string;
  onNavigate?: (p: string) => void;
}) {
  const electionId = selectedElectionId || 'elec-1';
  const election = dummyElections.find(e => e.id === electionId) || dummyElections[0];
  const candidates = dummyCandidates.filter(c => c.electionId === election.id);

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [voted, setVoted] = useState(false);
  const [votedCandidate, setVotedCandidate] = useState<Candidate | null>(null);

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setConfirmModal(true);
  };

  const handleConfirmVote = () => {
    setVoted(true);
    setVotedCandidate(selectedCandidate);
    setConfirmModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Bilik Suara Digital" 
        subtitle="Berikan suara Anda secara demokratis, aman, dan rahasia" 
      />

      <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white relative overflow-hidden">
        <div className="relative z-10">
          <Badge color="indigo">Instansi: {election.instansiName}</Badge>
          <h2 className="text-xl sm:text-2xl font-bold mt-2 mb-2">{election.title}</h2>
          <p className="text-sm text-slate-300 max-w-2xl">{election.description}</p>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      </Card>

      {voted ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-emerald-200 bg-emerald-50/20">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Suara Anda Berhasil Dikirim!</h3>
          <p className="text-sm text-slate-500 max-w-md mt-2">
            Terima kasih telah berpartisipasi. Anda telah memilih <strong className="text-indigo-600 font-semibold">{votedCandidate?.name}</strong>. Satu suara Anda menentukan masa depan instansi.
          </p>
          <div className="mt-6 p-4 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-400 mb-6">
            Hash Transaksi: 0x{Math.random().toString(16).substring(2, 10)}...{Math.random().toString(16).substring(2, 6)}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => onNavigate?.('dashboard')}>Kembali ke Dashboard</Button>
            <Button onClick={() => onNavigate?.('results')}>Lihat Hasil Pemilu</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 text-center">Daftar Kandidat Calon BEM</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {candidates.map((cand, idx) => (
              <Card key={cand.id} className="flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-2 hover:border-indigo-200 group">
                <div className="text-center">
                  {/* Candidate Number / Badge */}
                  <div className="flex justify-center mb-4">
                    <span className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Photo Placeholder */}
                  <div className="aspect-[4/3] w-full rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 mb-4 border border-slate-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5" />
                    <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
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
            <Button variant="secondary" onClick={() => setConfirmModal(false)}>Batal</Button>
            <Button variant="success" onClick={handleConfirmVote}>Ya, Kirim Suara</Button>
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
