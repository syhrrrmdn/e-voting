'use client';
import React, { useState } from 'react';
import { PageHeader, Card, Table, Badge, Button, Modal, Input, Select, SearchInput, Avatar, type TableColumn } from '@/components/ui';
import { dummyUsers } from '@/data/dummy';
import type { User } from '@/types';

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const filtered = dummyUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });
  const columns: TableColumn<User>[] = [
    { key: 'name', label: 'User', render: (r) => (
      <div className="flex items-center gap-3">
        <Avatar name={r.name} size="sm" />
        <div><p className="font-medium text-slate-900">{r.name}</p><p className="text-xs text-slate-400">{r.email}</p></div>
      </div>
    )},
    { key: 'role', label: 'Role', render: (r) => <Badge color={r.role==='admin'?'indigo':r.role==='election_admin'?'green':'blue'}>{r.role==='admin'?'Admin Sistem':r.role==='election_admin'?'Admin Pemilihan':'Voter'}</Badge> },
    { key: 'instansiName', label: 'Instansi', className: 'hidden md:table-cell' },
    { key: 'status', label: 'Status', render: (r) => <Badge color={r.status==='active'?'green':'red'} dot>{r.status==='active'?'Aktif':'Nonaktif'}</Badge> },
    { key: 'createdAt', label: 'Joined', className: 'hidden lg:table-cell', render: (r) => <span className="text-slate-500">{new Date(r.createdAt).toLocaleDateString('id-ID')}</span> },
    { key: 'actions', label: '', render: () => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm">Edit</Button>
        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">Hapus</Button>
      </div>
    )},
  ];
  return (
    <div>
      <PageHeader title="User Management" subtitle={`${dummyUsers.length} users terdaftar`} action={<Button onClick={() => setModalOpen(true)} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>}>Tambah User</Button>} />
      <Card padding={false}>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Cari nama atau email..." /></div>
          <Select options={[{value:'all',label:'Semua Role'},{value:'admin',label:'Admin Sistem'},{value:'election_admin',label:'Admin Pemilihan'},{value:'voter',label:'Voter'}]} value={roleFilter} onChange={e => setRoleFilter(e.target.value)} />
        </div>
        <Table columns={columns} data={filtered} />
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah User Baru" size="md"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button><Button onClick={() => setModalOpen(false)}>Simpan</Button></>}>
        <div className="space-y-4">
          <Input label="Nama Lengkap" placeholder="Masukkan nama lengkap" />
          <Input label="Email" type="email" placeholder="email@domain.com" />
          <Select label="Role" options={[{value:'voter',label:'Voter'},{value:'election_admin',label:'Admin Pemilihan'},{value:'admin',label:'Admin Sistem'}]} />
          <Select label="Instansi" options={[{value:'inst-1',label:'Universitas Muda Nusantara'},{value:'inst-2',label:'SMA Negeri 1 Jakarta'},{value:'inst-3',label:'PT Teknologi Bangsa'}]} />
        </div>
      </Modal>
    </div>
  );
}
