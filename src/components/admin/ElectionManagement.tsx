'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Table, Badge, Button, Modal, SearchInput, Tabs, type TableColumn } from '@/components/ui';
import { BarChart, PieChart } from '@/components/ui/Charts';

const statusColor = (s: string) => {
  switch (s) {
    case 'active': return 'green';
    case 'published': return 'indigo';
    case 'draft': return 'yellow';
    case 'closed': return 'gray';
    default: return 'gray';
  }
};

const statusLabel = (s: string) => {
  switch (s) {
    case 'active': return 'Aktif';
    case 'published': return 'Diterbitkan';
    case 'draft': return 'Draf';
    case 'closed': return 'Selesai';
    default: return s;
  }
};

export default function AdminElectionManagement() {
  const [elections, setElections] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Monitoring Modal State
  const [monitorModalOpen, setMonitorModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState<any>(null);
  const [modalCandidates, setModalCandidates] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [electionsRes, candidatesRes] = await Promise.all([
        fetch('/api/elections'),
        fetch('/api/candidates'),
      ]);
      const electionsJson = await electionsRes.json();
      const candidatesJson = await candidatesRes.json();

      if (electionsJson.success && electionsJson.data) {
        setElections(electionsJson.data);
      }
      if (candidatesJson.success && candidatesJson.data) {
        setCandidates(candidatesJson.data);
      }
    } catch (err) {
      console.error('Gagal memuat data pemilihan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenMonitor = (election: any) => {
    setSelectedElection(election);
    const elCandidates = candidates.filter(c => c.electionId === election._id);
    setModalCandidates(elCandidates);
    setMonitorModalOpen(true);
  };

  const filtered = elections.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'all' || e.status === tab;
    return matchSearch && matchTab;
  });

  const tabCounts = {
    all: elections.length,
    active: elections.filter(e => e.status === 'active').length,
    published: elections.filter(e => e.status === 'published').length,
    draft: elections.filter(e => e.status === 'draft').length,
    closed: elections.filter(e => e.status === 'closed').length,
  };

  const columns: TableColumn<any>[] = [
    { 
      key: 'title', 
      label: 'Pemilihan', 
      render: (r) => (
        <div>
          <p className="font-semibold text-slate-950">{r.title}</p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{r.description}</p>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (r) => <Badge color={statusColor(r.status)} dot>{statusLabel(r.status)}</Badge> 
    },
    { 
      key: 'candidates', 
      label: 'Kandidat', 
      className: 'hidden lg:table-cell', 
      render: (r) => <span className="font-semibold text-slate-700">{r.candidates?.length || 0}</span> 
    },
    { 
      key: 'totalVotes', 
      label: 'Suara Masuk', 
      className: 'hidden lg:table-cell', 
      render: (r) => <span className="font-semibold text-slate-700">{r.status === 'closed' ? (r.totalVotes || 0).toLocaleString() : '🔒 Dikunci'}</span> 
    },
    { 
      key: 'startTime', 
      label: 'Periode Waktu', 
      className: 'hidden xl:table-cell', 
      render: (r) => (
        <div className="text-xs text-slate-500 font-medium">
          {new Date(r.startTime).toLocaleString('id-ID')} - {new Date(r.endTime).toLocaleString('id-ID')}
        </div>
      )
    },
    { 
      key: 'actions', 
      label: 'Aksi', 
      render: (r) => (
        <Button variant="secondary" size="sm" onClick={() => handleOpenMonitor(r)}>
          Monitor &amp; Hasil
        </Button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Pemilihan" 
        subtitle="Monitoring status, aktivitas, dan hasil dari seluruh jenis pemilihan aktif maupun draf" 
      />

      <div className="mb-4">
        <Tabs 
          tabs={[
            { key: 'all', label: 'Semua', count: tabCounts.all },
            { key: 'active', label: 'Aktif', count: tabCounts.active },
            { key: 'published', label: 'Diterbitkan', count: tabCounts.published },
            { key: 'draft', label: 'Draf', count: tabCounts.draft },
            { key: 'closed', label: 'Selesai', count: tabCounts.closed }
          ]} 
          active={tab} 
          onChange={setTab} 
        />
      </div>

      <Card padding={false}>
        <div className="p-4 border-b border-slate-100">
          <SearchInput 
            value={search} 
            onChange={setSearch} 
            placeholder="Cari pemilihan berdasarkan nama..." 
          />
        </div>
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin mb-3" />
            <p className="text-sm font-medium">Memuat data pemilihan...</p>
          </div>
        ) : (
          <Table columns={columns} data={filtered} />
        )}
      </Card>

      {/* Monitor & Hasil Modal */}
      {selectedElection && (
        <Modal 
          open={monitorModalOpen} 
          onClose={() => setMonitorModalOpen(false)} 
          title={`Detail & Monitoring Pemilihan: ${selectedElection.title}`} 
          size="xl"
          footer={
            <Button variant="secondary" onClick={() => setMonitorModalOpen(false)}>Tutup</Button>
          }
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-400 uppercase">Status Saat Ini</span>
                <div className="mt-1 flex items-center gap-2">
                  <Badge color={statusColor(selectedElection.status)} dot>
                    {statusLabel(selectedElection.status)}
                  </Badge>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-400 uppercase">Total Partisipasi Suara</span>
                <p className="text-xl font-bold text-slate-800 mt-0.5">{selectedElection.status === 'closed' ? `${(selectedElection.totalVotes || 0).toLocaleString()} Suara` : '🔒 Dikunci (Sesi Berlangsung)'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-400 uppercase font-mono">Dibuat Oleh</span>
                <p className="text-sm font-bold text-slate-800 mt-1">{selectedElection.createdBy || 'Admin Pemilihan'}</p>
              </div>
            </div>

            {/* Description & Rules info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Deskripsi Pemilihan</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedElection.description}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Mulai:</span>
                    <span className="font-semibold text-slate-700">{new Date(selectedElection.startTime).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Selesai:</span>
                    <span className="font-semibold text-slate-700">{new Date(selectedElection.endTime).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h4 className="text-sm font-bold text-slate-800 mb-2">Konfigurasi Aturan Pemilih</h4>
                <p className="text-xs text-slate-500 mb-3">Kriteria eligibility yang diterapkan pada pemilih untuk pemilihan ini:</p>
                <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto max-h-36">
                  <pre className="text-xs text-emerald-400 font-mono">
                    {JSON.stringify(selectedElection.rules, null, 2)}
                  </pre>
                </div>
              </Card>
            </div>

            {/* Realtime Results Graph */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Hasil Perolehan Suara
              </h4>
              {selectedElection.status !== 'closed' ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-sm">
                  🔒 Hasil perolehan suara kandidat dikunci sampai pemilihan ini resmi selesai (status CLOSED) untuk menjaga kerahasiaan &amp; netralitas pemilu.
                </div>
              ) : modalCandidates.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  <div className="flex justify-center p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                    <PieChart data={modalCandidates.map(c => ({ label: c.name, value: c.voteCount || 0 }))} />
                  </div>
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                    <BarChart data={modalCandidates.map(c => ({ label: c.name, value: c.voteCount || 0 }))} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                  Belum ada kandidat yang terdaftar atau suara masuk untuk pemilihan ini.
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
