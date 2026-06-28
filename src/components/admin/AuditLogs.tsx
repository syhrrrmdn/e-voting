'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Table, Badge, SearchInput, Select, type TableColumn, Modal, Button } from '@/components/ui';

const actionColor = (a: string) => {
  if (a.includes('TAMBAH') || a === 'CREATE') return 'green';
  if (a.includes('UBAH') || a === 'UPDATE') return 'blue';
  if (a.includes('HAPUS') || a === 'DELETE') return 'red';
  if (a === 'LOGIN') return 'cyan';
  if (a === 'VOTE') return 'indigo';
  if (a === 'PUBLISH') return 'green';
  return 'gray';
};

function formatRules(rules: any): string {
  if (!rules) return 'Terbuka untuk semua pemilih (Tanpa syarat)';
  if (typeof rules === 'string') return rules;

  const conditions: string[] = [];

  // Format single conditions
  if (Array.isArray(rules.conditions)) {
    rules.conditions.forEach((c: any) => {
      const fieldName = c.field === 'category' ? 'Kategori Pengguna' : c.field;
      const op = c.operator === '=' ? 'adalah' : c.operator === '!=' ? 'bukan' : c.operator === 'IN' ? 'salah satu dari' : c.operator;
      conditions.push(`[${fieldName} ${op} "${c.value}"]`);
    });
  }

  // Format nested groups
  if (Array.isArray(rules.groups)) {
    rules.groups.forEach((g: any) => {
      const sub = formatRules(g);
      if (sub && sub !== 'Terbuka untuk semua pemilih (Tanpa syarat)') {
        conditions.push(`(${sub})`);
      }
    });
  }

  if (conditions.length === 0) return 'Terbuka untuk semua pemilih (Tanpa syarat)';

  const logic = rules.logic || 'AND';
  return conditions.join(` ${logic.toUpperCase()} `);
}

function formatValue(val: any, fieldName?: string): string {
  if (val === undefined || val === null) return '(Kosong)';
  if (fieldName === 'rules') {
    return formatRules(val);
  }
  if (Array.isArray(val)) {
    return val.length > 0 ? val.join(', ') : '(Kosong)';
  }
  if (typeof val === 'object') {
    // Check if it looks like rules object
    if (val.logic || val.conditions || val.groups) {
      return formatRules(val);
    }
    return JSON.stringify(val);
  }
  return String(val);
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal State for details
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
      render: (r) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-slate-600 text-sm font-medium">{r.description}</span>
          {r.details && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedDetails(r);
                setModalOpen(true);
              }}
              className="shrink-0 text-xs py-1"
            >
              Lihat Perubahan
            </Button>
          )}
        </div>
      )
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
              { value: 'PEMILIHAN_BARU', label: 'PEMILIHAN_BARU' },
              { value: 'UBAH_PEMILIHAN', label: 'UBAH_PEMILIHAN' },
              { value: 'UBAH_ATURAN_PEMILIH', label: 'UBAH_ATURAN_PEMILIH' },
              { value: 'UBAH_STATUS_PEMILIHAN', label: 'UBAH_STATUS_PEMILIHAN' },
              { value: 'HAPUS_PEMILIHAN', label: 'HAPUS_PEMILIHAN' },
              { value: 'TAMBAH_KANDIDAT', label: 'TAMBAH_KANDIDAT' },
              { value: 'UBAH_KANDIDAT', label: 'UBAH_KANDIDAT' },
              { value: 'HAPUS_KANDIDAT', label: 'HAPUS_KANDIDAT' },
              { value: 'LOGIN', label: 'LOGIN' }
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

      {/* Modal Detail Perubahan */}
      {selectedDetails && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Detail Perubahan: ${selectedDetails.action}`}
          size="lg"
          footer={
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Tutup</Button>
          }
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <p className="text-sm text-slate-500">Aksi ini dilakukan oleh <strong className="text-slate-800">{selectedDetails.userName}</strong> pada <strong className="text-slate-800">{new Date(selectedDetails.timestamp).toLocaleString('id-ID')}</strong>.</p>
              <p className="text-sm font-semibold text-slate-700 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedDetails.description}</p>
            </div>

            {selectedDetails.details && selectedDetails.details.before !== undefined && typeof selectedDetails.details.before === 'object' && (selectedDetails.details.before.logic || selectedDetails.details.before.conditions) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Aturan Sebelum</span>
                  <div className="bg-slate-50 border border-slate-200 text-slate-700 p-4 rounded-xl font-medium text-sm leading-relaxed whitespace-pre-wrap">
                    {formatRules(selectedDetails.details.before)}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Aturan Sesudah</span>
                  <div className="bg-emerald-50/20 border border-emerald-200 text-emerald-800 p-4 rounded-xl font-medium text-sm leading-relaxed whitespace-pre-wrap">
                    {formatRules(selectedDetails.details.after)}
                  </div>
                </div>
              </div>
            ) : selectedDetails.details && selectedDetails.details.before !== undefined ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Sebelum Perubahan</span>
                  <div className="bg-slate-50 border border-slate-200 text-slate-700 p-4 rounded-xl font-mono text-sm overflow-auto max-h-96">
                    {formatValue(selectedDetails.details.before)}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Sesudah Perubahan</span>
                  <div className="bg-emerald-50/20 border border-emerald-200 text-emerald-850 p-4 rounded-xl font-mono text-sm overflow-auto max-h-96">
                    {formatValue(selectedDetails.details.after)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                    <tr>
                      <th className="py-3 px-4">Properti / Field</th>
                      <th className="py-3 px-4 text-red-650 bg-red-50/20">Sebelum</th>
                      <th className="py-3 px-4 text-emerald-650 bg-emerald-50/20">Sesudah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {Object.keys(selectedDetails.details || {}).map(field => {
                      const val = selectedDetails.details[field];
                      return (
                        <tr key={field} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-bold text-slate-700 capitalize">{field}</td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">{formatValue(val?.before, field)}</td>
                          <td className="py-3.5 px-4 text-slate-900 font-mono text-xs font-bold">{formatValue(val?.after, field)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
