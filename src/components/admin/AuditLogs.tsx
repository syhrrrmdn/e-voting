'use client';
import React, { useState } from 'react';
import { PageHeader, Card, Table, Badge, SearchInput, Select, type TableColumn } from '@/components/ui';
import { dummyAuditLogs } from '@/data/dummy';
import type { AuditLog } from '@/types';

const actionColor = (a: string) => a==='CREATE'?'green':a==='UPDATE'?'blue':a==='DELETE'?'red':a==='VOTE'?'indigo':a==='PUBLISH'?'cyan':'gray';

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const filtered = dummyAuditLogs.filter(l => {
    const matchSearch = l.description.toLowerCase().includes(search.toLowerCase()) || l.userName.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    return matchSearch && matchAction;
  });
  const columns: TableColumn<AuditLog>[] = [
    { key: 'timestamp', label: 'Waktu', render: (r) => (
      <div className="text-sm"><p className="text-slate-700">{new Date(r.timestamp).toLocaleDateString('id-ID')}</p><p className="text-xs text-slate-400">{new Date(r.timestamp).toLocaleTimeString('id-ID')}</p></div>
    )},
    { key: 'userName', label: 'User', render: (r) => <span className="font-medium text-slate-700">{r.userName}</span> },
    { key: 'action', label: 'Action', render: (r) => <Badge color={actionColor(r.action)}>{r.action}</Badge> },
    { key: 'resource', label: 'Resource', className: 'hidden md:table-cell', render: (r) => <Badge color="gray">{r.resource}</Badge> },
    { key: 'description', label: 'Deskripsi', className: 'hidden lg:table-cell', render: (r) => <span className="text-slate-600 text-sm line-clamp-1">{r.description}</span> },
  ];
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Rekam jejak semua aktivitas sistem" />
      <Card padding={false}>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Cari log..." /></div>
          <Select options={[{value:'all',label:'Semua Action'},{value:'CREATE',label:'Create'},{value:'UPDATE',label:'Update'},{value:'DELETE',label:'Delete'},{value:'VOTE',label:'Vote'},{value:'PUBLISH',label:'Publish'}]} value={actionFilter} onChange={e => setActionFilter(e.target.value)} />
        </div>
        <Table columns={columns} data={filtered} />
      </Card>
    </div>
  );
}
