'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Badge, Button, Modal, Input, Textarea, Toggle } from '@/components/ui';

const statusColor = (s: string) => s==='active'?'green':s==='published'?'indigo':s==='draft'?'yellow':'gray';

export default function ElectionManagement({ onNavigate, onSelectElection }: { onNavigate?: (p: string) => void; onSelectElection?: (id: string) => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchElections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/elections');
      const json = await res.json();
      if (json.success && json.data) {
        setElections(json.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data pemilihan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const handleAction = (id: string, targetPage: string) => {
    onSelectElection?.(id);
    onNavigate?.(targetPage);
  };

  const handleOpenAddModal = () => {
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setPublishImmediately(false);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !startTime || !endTime) {
      setError('Harap lengkapi semua kolom wajib');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/elections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          status: publishImmediately ? 'published' : 'draft',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        fetchElections();
      } else {
        setError(json.message || 'Gagal menyimpan data pemilihan');
      }
    } catch (err) {
      setError('Gagal menghubungkan ke server');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, targetStatus: string) => {
    try {
      const res = await fetch(`/api/elections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });
      const json = await res.json();
      if (json.success) {
        fetchElections();
      } else {
        alert(json.message || 'Gagal memperbarui status');
      }
    } catch (err) {
      alert('Gagal menghubungkan ke server');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus draf pemilihan ini?')) return;
    
    try {
      const res = await fetch(`/api/elections/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        fetchElections();
      } else {
        alert(json.message || 'Gagal menghapus pemilihan');
      }
    } catch (err) {
      alert('Gagal menghubungkan ke server');
    }
  };

  return (
    <div>
      <PageHeader 
        title="Manajemen Pemilihan" 
        subtitle="Kelola pemilihan Anda" 
        action={
          <Button onClick={handleOpenAddModal} icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }>
            Buat Pemilihan
          </Button>
        } 
      />

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin mb-3" />
          <p className="text-sm font-medium">Memuat data pemilihan...</p>
        </div>
      ) : elections.length === 0 ? (
        <Card className="text-center py-12 text-slate-400">
          <p className="text-sm">Belum ada pemilihan yang dibuat. Klik tombol di kanan atas untuk membuat.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {elections.map(e => (
            <Card key={e._id} hover className="relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <Badge color={statusColor(e.status)} dot>
                    {e.status==='active'?'Aktif':e.status==='published'?'Diterbitkan':e.status==='draft'?'Draf':'Ditutup'}
                  </Badge>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => handleAction(e._id, 'candidates')}>Atur Kandidat</Button>
                    {e.status === 'draft' && (
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(e._id)}>Hapus</Button>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{e.title}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{e.description}</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div 
                    onClick={() => handleAction(e._id, 'candidates')}
                    className="text-center p-2 bg-slate-50 hover:bg-indigo-50/50 rounded-lg cursor-pointer transition-colors"
                  >
                    <p className="text-lg font-bold text-slate-900">{e.candidates?.length || 0}</p>
                    <p className="text-xs text-slate-400">Kandidat</p>
                  </div>
                  <div 
                    onClick={() => handleAction(e._id, 'results')}
                    className="text-center p-2 bg-slate-50 hover:bg-indigo-50/50 rounded-lg cursor-pointer transition-colors"
                  >
                    <p className="text-lg font-bold text-slate-900">{e.totalVotes || 0}</p>
                    <p className="text-xs text-slate-400">Suara</p>
                  </div>
                  <div 
                    onClick={() => handleAction(e._id, 'rules')}
                    className="text-center p-2 bg-slate-50 hover:bg-indigo-50/50 rounded-lg cursor-pointer transition-colors"
                  >
                    <p className="text-lg font-bold text-slate-900">
                      {((e.rules?.conditions?.length || 0) + (e.rules?.groups?.length || 0))}
                    </p>
                    <p className="text-xs text-slate-400">Aturan</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 mt-auto">
                <span>{new Date(e.startTime).toLocaleDateString('id-ID')} — {new Date(e.endTime).toLocaleDateString('id-ID')}</span>
                {e.status === 'draft' && (
                  <Button variant="success" size="sm" onClick={() => handleUpdateStatus(e._id, 'published')}>Terbitkan</Button>
                )}
                {e.status === 'published' && (
                  <div className="flex gap-1.5">
                    <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(e._id, 'draft')}>Batal</Button>
                    <Button variant="success" size="sm" onClick={() => handleUpdateStatus(e._id, 'active')}>Aktifkan</Button>
                  </div>
                )}
                {e.status === 'active' && (
                  <Button variant="danger" size="sm" onClick={() => handleUpdateStatus(e._id, 'closed')}>Tutup Pemilu</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Buat Pemilihan Baru" size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
              {error}
            </div>
          )}
          <Input 
            label="Judul Pemilihan" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Contoh: Pemilihan Ketua BEM 2025" 
          />
          <Textarea 
            label="Deskripsi" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Deskripsi singkat tentang pemilihan ini" 
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Waktu Mulai" 
              type="datetime-local" 
              value={startTime} 
              onChange={(e) => setStartTime(e.target.value)} 
            />
            <Input 
              label="Waktu Selesai" 
              type="datetime-local" 
              value={endTime} 
              onChange={(e) => setEndTime(e.target.value)} 
            />
          </div>
          <Toggle 
            checked={publishImmediately} 
            onChange={setPublishImmediately} 
            label="Langsung terbitkan setelah dibuat" 
          />
        </div>
      </Modal>
    </div>
  );
}
