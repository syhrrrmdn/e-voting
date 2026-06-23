'use client';
import React, { useState } from 'react';
import { PageHeader, Card, Table, Badge, Button, Modal, Input, Textarea, SearchInput, Tabs, type TableColumn } from '@/components/ui';
import { dummyElections } from '@/data/dummy';
import type { Election } from '@/types';

const statusColor = (s: string) => s==='active'?'green':s==='published'?'indigo':s==='draft'?'yellow':'gray';

export default function AdminElectionManagement({ 
  onNavigate, 
  onSelectElection, 
  onRoleChange 
}: { 
  onNavigate?: (p: string) => void; 
  onSelectElection?: (id: string) => void; 
  onRoleChange?: (r: 'admin' | 'election_admin' | 'voter') => void;
}) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  const handleManage = (id: string) => {
    onSelectElection?.(id);
    onRoleChange?.('election_admin');
    onNavigate?.('dashboard');
  };

  const filtered = dummyElections.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'all' || e.status === tab;
    return matchSearch && matchTab;
  });

  const columns: TableColumn<Election>[] = [
    { key: 'title', label: 'Election', render: (r) => (
      <div><p className="font-medium text-slate-900">{r.title}</p><p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{r.description}</p></div>
    )},
    { key: 'instansiName', label: 'Instansi', className: 'hidden md:table-cell', render: (r) => <span className="text-slate-600">{r.instansiName}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge color={statusColor(r.status)} dot>{r.status.charAt(0).toUpperCase()+r.status.slice(1)}</Badge> },
    { key: 'candidates', label: 'Kandidat', className: 'hidden lg:table-cell', render: (r) => <span className="font-semibold text-slate-700">{r.candidates.length}</span> },
    { key: 'totalVotes', label: 'Votes', className: 'hidden lg:table-cell', render: (r) => <span className="font-semibold text-slate-700">{r.totalVotes.toLocaleString()}</span> },
    { key: 'startTime', label: 'Periode', className: 'hidden xl:table-cell', render: (r) => (
      <div className="text-xs text-slate-500">{new Date(r.startTime).toLocaleDateString('id-ID')} - {new Date(r.endTime).toLocaleDateString('id-ID')}</div>
    )},
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => handleManage(r.id)}>Kelola</Button>
      </div>
    )},
  ];
  return (
    <div>
      <PageHeader title="Election Management" subtitle="Kelola semua pemilihan di seluruh instansi" action={<Button onClick={() => setModalOpen(true)} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>}>Buat Election</Button>} />
      <div className="mb-4"><Tabs tabs={[{key:'all',label:'Semua',count:dummyElections.length},{key:'active',label:'Active',count:dummyElections.filter(e=>e.status==='active').length},{key:'published',label:'Published',count:dummyElections.filter(e=>e.status==='published').length},{key:'draft',label:'Draft',count:dummyElections.filter(e=>e.status==='draft').length},{key:'closed',label:'Closed',count:dummyElections.filter(e=>e.status==='closed').length}]} active={tab} onChange={setTab} /></div>
      <Card padding={false}>
        <div className="p-4 border-b border-slate-100"><SearchInput value={search} onChange={setSearch} placeholder="Cari election..." /></div>
        <Table columns={columns} data={filtered} />
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Buat Election Baru" size="lg"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button><Button onClick={() => setModalOpen(false)}>Simpan</Button></>}>
        <div className="space-y-4">
          <Input label="Judul Election" placeholder="Contoh: Pemilihan Ketua BEM 2025" />
          <Textarea label="Deskripsi" placeholder="Deskripsi singkat tentang election ini" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Waktu Mulai" type="datetime-local" />
            <Input label="Waktu Selesai" type="datetime-local" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
