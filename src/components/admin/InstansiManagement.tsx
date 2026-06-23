'use client';
import React, { useState } from 'react';
import { PageHeader, Card, Table, Badge, Button, Modal, Input, Select, SearchInput, type TableColumn } from '@/components/ui';
import { dummyInstansi } from '@/data/dummy';
import type { Instansi } from '@/types';

export default function InstansiManagement() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const filtered = dummyInstansi.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase()));
  const columns: TableColumn<Instansi>[] = [
    { key: 'name', label: 'Instansi', render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-600 font-bold text-sm">{r.code.slice(0,2)}</div>
        <div><p className="font-medium text-slate-900">{r.name}</p><p className="text-xs text-slate-400">Kode: {r.code}</p></div>
      </div>
    )},
    { key: 'type', label: 'Tipe', render: (r) => <Badge color="blue">{r.type}</Badge> },
    { key: 'userCount', label: 'Users', className: 'hidden md:table-cell', render: (r) => <span className="font-semibold text-slate-700">{r.userCount.toLocaleString()}</span> },
    { key: 'electionCount', label: 'Elections', className: 'hidden md:table-cell', render: (r) => <span className="font-semibold text-slate-700">{r.electionCount}</span> },
    { key: 'status', label: 'Status', render: (r) => <Badge color={r.status==='active'?'green':'red'} dot>{r.status==='active'?'Aktif':'Nonaktif'}</Badge> },
    { key: 'actions', label: '', render: () => (
      <div className="flex gap-1"><Button variant="ghost" size="sm">Edit</Button><Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">Hapus</Button></div>
    )},
  ];
  return (
    <div>
      <PageHeader title="Instansi Management" subtitle={`${dummyInstansi.length} instansi terdaftar`} action={<Button onClick={() => setModalOpen(true)} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>}>Tambah Instansi</Button>} />
      <Card padding={false}>
        <div className="p-4 border-b border-slate-100"><SearchInput value={search} onChange={setSearch} placeholder="Cari instansi..." /></div>
        <Table columns={columns} data={filtered} />
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Instansi Baru" size="md"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button><Button onClick={() => setModalOpen(false)}>Simpan</Button></>}>
        <div className="space-y-4">
          <Input label="Nama Instansi" placeholder="Nama instansi" />
          <Input label="Kode" placeholder="Kode singkat (misal: UMN)" />
          <Select label="Tipe" options={[{value:'universitas',label:'Universitas'},{value:'sma',label:'SMA'},{value:'perusahaan',label:'Perusahaan'},{value:'organisasi',label:'Organisasi'}]} />
        </div>
      </Modal>
    </div>
  );
}
