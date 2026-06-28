'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Table, Badge, SearchInput, Select, type TableColumn } from '@/components/ui';

const actionColor = (a: string) => {
  switch (a) {
    case 'CREATE': return 'green';
    case 'UPDATE': return 'blue';
    case 'DELETE': return 'red';
    case 'LOGIN': return 'cyan';
    case 'VOTE': return 'indigo';
    case 'PUBLISH': return 'green';
    default: return 'gray';
  }
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (actionFilter !== 'all') params.set('action', actionFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/audit?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setLogs(json.data);
      }
    } catch (err) {
      console.error('Gagal memuat audit log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLogs();
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const columns: TableColumn<any>[] = [
    { 
      key: 'timestamp', 
      label: 'Waktu', 
      render: (r) => (
        <div className="text-sm">
          <p className="text-slate-700 font-medium">
            {new Date(r.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <p className="text-xs text-slate-400">
            {new Date(r.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )
    },
    { 
      key: 'userName', 
      label: 'Pengguna', 
      render: (r) => <span className="font-semibold text-slate-800">{r.userName}</span> 
    },
    { 
      key: 'action', 
      label: 'Jenis Aksi', 
      render: (r) => <Badge color={actionColor(r.action)}>{r.action}</Badge> 
    },
    { 
      key: 'resource', 
      label: 'Sumber Daya', 
      className: 'hidden md:table-cell', 
      render: (r) => <Badge color="gray">{r.resource}</Badge> 
    },
    { 
      key: 'description', 
      label: 'Deskripsi Detail', 
      className: 'table-cell', 
      render: (r) => <span className="text-slate-600 text-sm font-medium">{r.description}</span> 
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Log Audit" 
        subtitle="Rekam jejak kepatuhan audit trail aktivitas sistem e-voting secara real-time" 
      />

      <Card padding={false}>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput 
              value={search} 
              onChange={setSearch} 
              placeholder="Cari berdasarkan nama pengguna atau rincian deskripsi..." 
            />
          </div>
          <Select 
            options={[
              { value: 'all', label: 'Semua Aksi' },
              { value: 'CREATE', label: 'CREATE' },
              { value: 'UPDATE', label: 'UPDATE' },
              { value: 'DELETE', label: 'DELETE' },
              { value: 'LOGIN', label: 'LOGIN' },
              { value: 'VOTE', label: 'VOTE' },
              { value: 'PUBLISH', label: 'PUBLISH' }
            ]} 
            value={actionFilter} 
            onChange={e => setActionFilter(e.target.value)} 
          />
        </div>
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin mb-3" />
            <p className="text-sm font-medium">Memuat log audit...</p>
          </div>
        ) : (
          <Table columns={columns} data={logs} />
        )}
      </Card>
    </div>
  );
}
