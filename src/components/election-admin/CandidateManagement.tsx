'use client';
import React, { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { PageHeader, Card, Button, Modal, Input, Textarea, Select } from '@/components/ui';
import Swal from '@/lib/swal';

export default function CandidateManagement({ selectedElectionId }: { selectedElectionId?: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState(selectedElectionId || '');
  const [elections, setElections] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  
  // Form State
  const [editingCandidate, setEditingCandidate] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mainError, setMainError] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch all elections
  const fetchElections = async () => {
    try {
      const res = await fetch('/api/elections');
      const json = await res.json();
      if (json.success && json.data) {
        setElections(json.data);
        if (json.data.length > 0 && !selectedElection) {
          setSelectedElection(json.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data pemilihan:', err);
    }
  };

  // Fetch candidates for selected election
  const fetchCandidates = async () => {
    if (!selectedElection) return;
    setLoading(true);
    setMainError('');
    try {
      const res = await fetch(`/api/candidates?electionId=${selectedElection}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCandidates(json.data);
      } else {
        setMainError(json.message || 'Gagal memuat daftar kandidat');
      }
    } catch (err) {
      setMainError('Gagal menghubungkan ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [selectedElection]);

  const handleOpenAddModal = () => {
    setEditingCandidate(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (candidate: any) => {
    setEditingCandidate(candidate);
    setName(candidate.name);
    setDescription(candidate.description || '');
    setImageUrl(candidate.image || '');
    setFormError('');
    setModalOpen(true);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Ukuran foto melebihi batas maksimal (5 MB). Silakan pilih foto dengan ukuran lebih kecil.');
      return;
    }

    setUploading(true);
    setFormError('');

    try {
      // Compress image client-side to ensure fast & reliable upload
      const base64Str = await compressImage(file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          file: base64Str, 
          folder: 'candidates',
          oldUrl: imageUrl || ''
        }),
      });
      const uploadJson = await uploadRes.json();

      if (uploadJson.success) {
        setImageUrl(uploadJson.url);
        setFormError('');
      } else {
        const detailErr = uploadJson.error?.error?.message || uploadJson.error?.message || uploadJson.message;
        if (detailErr && detailErr.toLowerCase().includes('timeout')) {
          setFormError('Koneksi waktu habis (Timeout). Koneksi internet lambat atau Cloudinary lambat merespons. Silakan coba lagi.');
        } else {
          setFormError(detailErr || 'Gagal mengunggah foto kandidat. Silakan periksa koneksi internet Anda.');
        }
      }
    } catch (err) {
      setFormError('Terjadi kesalahan saat memproses foto kandidat. Silakan gunakan format gambar JPG/PNG/WEBP.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError('Nama kandidat / pasangan calon wajib diisi.');
      return;
    }
    if (!selectedElection) {
      setFormError('Pilih pemilihan terlebih dahulu.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const url = editingCandidate 
        ? `/api/candidates/${editingCandidate._id}` 
        : '/api/candidates';
      
      const method = editingCandidate ? 'PUT' : 'POST';
      
      const body = {
        name,
        description,
        image: imageUrl,
        electionId: selectedElection
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (json.success) {
        setModalOpen(false);
        fetchCandidates();
        Swal.success('Berhasil!', editingCandidate ? 'Data kandidat berhasil diperbarui.' : 'Kandidat baru berhasil ditambahkan.');
      } else {
        setFormError(json.message || 'Gagal menyimpan data kandidat. Silakan periksa kelengkapan formulir Anda.');
      }
    } catch (err) {
      setFormError('Gagal menghubungkan ke server.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmResult = await Swal.confirm('Hapus Kandidat?', 'Apakah Anda yakin ingin menghapus kandidat ini?', 'Ya, Hapus');
    if (!confirmResult.isConfirmed) return;
    
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        fetchCandidates();
        Swal.success('Terhapus!', 'Kandidat berhasil dihapus.');
      } else {
        Swal.error('Gagal', json.message || 'Gagal menghapus kandidat');
      }
    } catch (err) {
      Swal.error('Error', 'Gagal menghubungkan ke server');
    }
  };

  const activeElectionObj = elections.find(e => e._id === selectedElection);
  const isElectionClosed = activeElectionObj?.status === 'closed';

  return (
    <div>
      <PageHeader 
        title="Manajemen Kandidat" 
        subtitle="Kelola kandidat untuk setiap pemilihan" 
        action={
          !isElectionClosed && selectedElection && (
            <Button onClick={handleOpenAddModal} icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            }>
              Tambah Kandidat
            </Button>
          )
        } 
      />

      <Card className="mb-6">
        <div className="max-w-xs">
          <Select 
            label="Pilih Pemilihan" 
            options={elections.map(e => ({ value: e._id, label: e.title }))} 
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
          />
        </div>
      </Card>

      {mainError && (
        <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
          {mainError}
        </div>
      )}

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-500">
          <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin mb-3" />
          <p className="text-sm font-medium">Memuat data kandidat...</p>
        </div>
      ) : candidates.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-slate-400">
          <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm">Belum ada kandidat untuk pemilihan ini.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((cand, i) => (
            <Card key={cand._id} className="flex flex-col justify-between overflow-hidden relative">
              <div>
                {/* Candidate Photo */}
                <div className="aspect-[4/3] w-full rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-medium text-lg relative overflow-hidden mb-4 border border-slate-200">
                  {cand.image ? (
                    <NextImage src={cand.image} alt={cand.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10" />
                      <div className="relative flex flex-col items-center gap-1">
                        <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs text-slate-400 text-center">Belum ada foto</span>
                      </div>
                    </>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/70 backdrop-blur-md rounded-md text-xs font-bold text-white">Nomor Urut 0{i + 1}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">{cand.name}</h4>
                <p className="text-sm text-slate-600 line-clamp-4 mb-4">{cand.description}</p>
              </div>
              {!isElectionClosed && (
                <div className="flex gap-2 pt-3 border-t border-slate-100 mt-auto">
                  <Button variant="secondary" className="flex-1" size="sm" onClick={() => handleOpenEditModal(cand)}>Edit</Button>
                  <Button variant="danger" className="flex-1" size="sm" onClick={() => handleDelete(cand._id)}>Hapus</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Candidate Modal Form */}
      <Modal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingCandidate ? "Ubah Data Kandidat" : "Tambah Kandidat Baru"} 
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Modal Error Notification */}
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-slide-in font-medium">
              <svg className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="leading-relaxed">{formError}</span>
            </div>
          )}

          <Input 
            label="Nama Kandidat / Pasangan Calon" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Contoh: Ahmad Rizky & Putri Handayani" 
          />

          <Textarea 
            label="Visi & Misi / Deskripsi" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Tuliskan visi misi singkat kandidat..." 
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Foto Kandidat</label>
            <div className="flex gap-4 items-center">
              {imageUrl && (
                <NextImage src={imageUrl} alt="Pratinjau" width={80} height={80} className="w-20 h-20 rounded-lg object-cover border border-slate-200 shrink-0" />
              )}
              <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-lg p-5 flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer bg-slate-50/50 hover:bg-slate-50">
                <svg className="w-7 h-7 mb-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-semibold">{uploading ? 'Mengunggah foto...' : 'Klik untuk memilih / unggah foto'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
              </label>
            </div>
            {/* Helper text for max size */}
            <p className="mt-2 text-xs text-slate-500 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Batas maksimal ukuran foto: <strong>5 MB</strong> (Format: JPG, PNG, WEBP)
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
