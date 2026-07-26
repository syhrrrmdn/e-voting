'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, Button, Input, Modal, Badge } from '@/components/ui';
import Swal from '@/lib/swal';
import { IAnnouncement } from '@/models/Announcement';

const categoryBadgeMap: Record<string, { color: 'red' | 'blue' | 'green' | 'yellow'; label: string }> = {
  PENTING:   { color: 'red', label: 'Penting' },
  INFORMASI: { color: 'blue', label: 'Informasi' },
  PANDUAN:   { color: 'green', label: 'Panduan' },
  UMUM:      { color: 'yellow', label: 'Umum' },
};

export default function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IAnnouncement | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'INFORMASI' as 'PENTING' | 'INFORMASI' | 'PANDUAN' | 'UMUM',
    imageUrl: '',
    isPinned: false,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/announcements');
      const json = await res.json();
      if (json.success) {
        setAnnouncements(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      category: 'INFORMASI',
      imageUrl: '',
      isPinned: false,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: IAnnouncement) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category || 'INFORMASI',
      imageUrl: item.imageUrl || '',
      isPinned: Boolean(item.isPinned),
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            file: base64, 
            folder: 'announcements',
            oldUrl: formData.imageUrl || ''
          }),
        });
        const json = await res.json();
        if (json.success && json.url) {
          setFormData((prev) => ({ ...prev, imageUrl: json.url }));
          Swal.success('Berhasil Upload', 'Foto pengumuman berhasil diunggah!');
        } else {
          Swal.error('Gagal Upload', json.message || 'Gagal mengunggah gambar');
        }
        setUploadingImage(false);
      };
    } catch (err) {
      Swal.error('Error', 'Terjadi kesalahan saat mengunggah gambar');
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      Swal.warning('Form Belum Lengkap', 'Judul dan isi pengumuman wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingItem ? `/api/announcements/${editingItem._id || editingItem.id}` : '/api/announcements';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        Swal.success(
          editingItem ? 'Pengumuman Diperbarui!' : 'Pengumuman Diterbitkan!',
          editingItem ? 'Data pengumuman berhasil disimpan.' : 'Pengumuman baru telah tampil di dashboard publik.'
        );
        setModalOpen(false);
        fetchAnnouncements();
      } else {
        Swal.error('Gagal Menyimpan', json.message || 'Terjadi kesalahan');
      }
    } catch (err) {
      Swal.error('Error', 'Gagal menghubungkan ke server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: IAnnouncement) => {
    const confirmed = await Swal.confirm(
      'Hapus Pengumuman?',
      `Pengumuman "${item.title}" akan dihapus dan tidak lagi tampil secara publik.`,
      'Hapus Sekarang'
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/announcements/${item._id || item.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        Swal.success('Terhapus!', 'Pengumuman berhasil dihapus.');
        fetchAnnouncements();
      } else {
        Swal.error('Gagal', json.message || 'Gagal menghapus pengumuman');
      }
    } catch (err) {
      Swal.error('Error', 'Terjadi kesalahan sistem');
    }
  };

  const handleTogglePin = async (item: IAnnouncement) => {
    try {
      const newStatus = !item.isPinned;
      const res = await fetch(`/api/announcements/${item._id || item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        Swal.success(newStatus ? 'Disematkan!' : 'Dilepas!', newStatus ? 'Pengumuman disematkan di atas.' : 'Pengumuman dilepas dari sematan.');
        fetchAnnouncements();
      }
    } catch (err) {
      Swal.error('Gagal', 'Gagal mengubah status pin');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pengumuman & Berita Resmi</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Kelola artikel pengumuman, berita, dan panduan publik yang langsung tampil di Dashboard Utama tanpa perlu login.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="shrink-0 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Buat Pengumuman Baru</span>
        </Button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <Card className="py-12 flex flex-col items-center justify-center text-gray-400">
          <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-gray-200 animate-spin mb-3" />
          <p className="text-sm font-medium">Memuat pengumuman...</p>
        </Card>
      ) : announcements.length === 0 ? (
        <Card className="py-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A2.5 2.5 0 013 11.2V9.8a2.5 2.5 0 012.39-2.497l.135-.003H8.5m10 4.5a3 3 0 01-3 3h-2.17l-3.33 3.33" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-800">Belum Ada Pengumuman</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Buat pengumuman atau berita resmi pertama Anda agar pengunjung dapat membacanya langsung di halaman depan.
          </p>
          <Button onClick={handleOpenCreate} className="mt-4 text-xs">
            Buat Pengumuman Pertama
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {announcements.map((item) => {
            const badgeInfo = categoryBadgeMap[item.category || 'INFORMASI'] || categoryBadgeMap.INFORMASI;
            return (
              <Card key={item._id || item.id} className="relative flex flex-col justify-between overflow-hidden group hover:border-gray-300 transition-all duration-200">
                <div>
                  {/* Poster Image if available */}
                  {item.imageUrl && (
                    <div className="relative w-full h-44 -mt-5 -mx-5 mb-4 overflow-hidden border-b border-gray-100 bg-gray-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Top Bar: Category & Pin */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge color={badgeInfo.color}>{badgeInfo.label}</Badge>
                      {item.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                          📌 Disematkan
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mt-1">
                    {item.title}
                  </h3>

                  {/* Snippet Content */}
                  <p className="text-xs text-gray-600 line-clamp-3 mt-2 leading-relaxed">
                    {item.content}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-medium">
                    Oleh: <strong className="text-gray-600">{item.authorName || 'Admin'}</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePin(item)}
                      title={item.isPinned ? 'Lepas Pin' : 'Sematkan di Atas'}
                      className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        item.isPinned ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      📌
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Create / Edit Announcement */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Pengumuman' : 'Tulis Pengumuman Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title Input */}
          <Input
            label="Judul Pengumuman *"
            placeholder="Masukkan judul pengumuman menarik..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          {/* Category & Pin Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kategori Pengumuman</label>
              <select
                value={formData.category}
                onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="INFORMASI">Informasi Umum</option>
                <option value="PENTING">Penting / Mendesak</option>
                <option value="PANDUAN">Panduan Memilih</option>
                <option value="UMUM">Berita Organisasi</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="text-xs font-semibold text-gray-700">📌 Sematkan di Urutan Teratas</span>
              </label>
            </div>
          </div>

          {/* Photo Upload via Cloudinary */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Gambar / Poster Pengumuman (Opsional)</label>
            <div className="flex items-center gap-3">
              {formData.imageUrl ? (
                <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                  <Image src={formData.imageUrl} alt="Poster preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="absolute top-1 right-1 p-0.5 bg-gray-900/80 text-white rounded-full text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="w-20 h-14 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-xs shrink-0">
                  No Image
                </div>
              )}

              <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>{uploadingImage ? 'Mengunggah...' : 'Unggah Poster'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
            </div>
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Isi Pengumuman Lengkap *</label>
            <textarea
              rows={6}
              placeholder="Tuliskan isi detail pengumuman di sini..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          {/* Form Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
            <Button type="submit" disabled={submitting || uploadingImage}>
              {submitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
