'use client';
import React, { useState } from 'react';
import { PageHeader, Card, Badge, Button, Modal, Input, Textarea, Toggle } from '@/components/ui';
import { dummyElections } from '@/data/dummy';

const statusColor = (s: string) => s==='active'?'green':s==='published'?'indigo':s==='draft'?'yellow':'gray';

export default function ElectionManagement({ onNavigate, onSelectElection }: { onNavigate?: (p: string) => void; onSelectElection?: (id: string) => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const elections = dummyElections.filter(e => e.instansiId === 'inst-1');

  const handleAction = (id: string, targetPage: string) => {
    onSelectElection?.(id);
    onNavigate?.(targetPage);
  };

  return (
    <div>
      <PageHeader title="Election Management" subtitle="Kelola pemilihan Anda" action={<Button onClick={() => setModalOpen(true)} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>}>Buat Election</Button>} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {elections.map(e => (
          <Card key={e.id} hover className="relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <Badge color={statusColor(e.status)} dot>{e.status.charAt(0).toUpperCase()+e.status.slice(1)}</Badge>
              <Button variant="ghost" size="sm" onClick={() => handleAction(e.id, 'candidates')}>Edit</Button>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{e.title}</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{e.description}</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div 
                onClick={() => handleAction(e.id, 'candidates')}
                className="text-center p-2 bg-slate-50 hover:bg-indigo-50/50 rounded-lg cursor-pointer transition-colors"
              >
                <p className="text-lg font-bold text-slate-900">{e.candidates.length}</p>
                <p className="text-xs text-slate-400">Kandidat</p>
              </div>
              <div 
                onClick={() => handleAction(e.id, 'results')}
                className="text-center p-2 bg-slate-50 hover:bg-indigo-50/50 rounded-lg cursor-pointer transition-colors"
              >
                <p className="text-lg font-bold text-slate-900">{e.totalVotes}</p>
                <p className="text-xs text-slate-400">Votes</p>
              </div>
              <div 
                onClick={() => handleAction(e.id, 'rules')}
                className="text-center p-2 bg-slate-50 hover:bg-indigo-50/50 rounded-lg cursor-pointer transition-colors"
              >
                <p className="text-lg font-bold text-slate-900">{e.rules.conditions.length + e.rules.groups.length}</p>
                <p className="text-xs text-slate-400">Rules</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
              <span>{new Date(e.startTime).toLocaleDateString('id-ID')} — {new Date(e.endTime).toLocaleDateString('id-ID')}</span>
              {e.status === 'draft' && <Button variant="success" size="sm">Publish</Button>}
              {e.status === 'published' && <Button variant="secondary" size="sm">Unpublish</Button>}
            </div>
          </Card>
        ))}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Buat Election Baru" size="lg"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button><Button onClick={() => setModalOpen(false)}>Simpan</Button></>}>
        <div className="space-y-4">
          <Input label="Judul Election" placeholder="Contoh: Pemilihan Ketua BEM 2025" />
          <Textarea label="Deskripsi" placeholder="Deskripsi singkat tentang election ini" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Waktu Mulai" type="datetime-local" />
            <Input label="Waktu Selesai" type="datetime-local" />
          </div>
          <Toggle checked={false} onChange={() => {}} label="Langsung publish setelah dibuat" />
        </div>
      </Modal>
    </div>
  );
}
