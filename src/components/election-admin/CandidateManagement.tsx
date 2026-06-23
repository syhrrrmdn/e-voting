'use client';
import React, { useState } from 'react';
import { PageHeader, Card, Button, Modal, Input, Textarea, Select } from '@/components/ui';
import { dummyCandidates, dummyElections } from '@/data/dummy';

export default function CandidateManagement({ selectedElectionId }: { selectedElectionId?: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState(selectedElectionId || 'elec-1');
  const [candidates, setCandidates] = useState(dummyCandidates);

  const filteredCandidates = candidates.filter(c => c.electionId === selectedElection);
  const elections = dummyElections.filter(e => e.instansiId === 'inst-1');

  const handleDelete = (id: string) => {
    setCandidates(candidates.filter(c => c.id !== id));
  };

  return (
    <div>
      <PageHeader 
        title="Candidate Management" 
        subtitle="Kelola kandidat untuk setiap pemilihan" 
        action={
          <Button onClick={() => setModalOpen(true)} icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }>
            Tambah Kandidat
          </Button>
        } 
      />

      <Card className="mb-6">
        <div className="max-w-xs">
          <Select 
            label="Pilih Election" 
            options={elections.map(e => ({ value: e.id, label: e.title }))} 
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
          />
        </div>
      </Card>

      {filteredCandidates.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-slate-400">
          <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm">Belum ada kandidat untuk pemilihan ini.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((cand, i) => (
            <Card key={cand.id} className="flex flex-col justify-between overflow-hidden relative">
              <div>
                {/* Candidate Photo Placeholder */}
                <div className="aspect-[4/3] w-full rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-medium text-lg relative overflow-hidden mb-4 border border-slate-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10" />
                  <div className="relative flex flex-col items-center gap-1">
                    <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs text-slate-400">Nomor Urut 0{i + 1}</span>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">{cand.name}</h4>
                <p className="text-sm text-slate-600 line-clamp-4 mb-4">{cand.description}</p>
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-100 mt-auto">
                <Button variant="secondary" className="flex-1" size="sm">Edit</Button>
                <Button variant="danger" className="flex-1" size="sm" onClick={() => handleDelete(cand.id)}>Hapus</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Tambah Kandidat Baru" 
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={() => setModalOpen(false)}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nama Kandidat" placeholder="Masukkan nama kandidat" />
          <Textarea label="Visi & Misi / Deskripsi" placeholder="Tuliskan visi misi singkat kandidat..." />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Foto Kandidat (Placeholder)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-slate-600 transition-colors cursor-pointer">
              <svg className="w-8 h-8 mb-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">Klik untuk upload foto dummy</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
