'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Table, Badge, Button, Modal, Input, Select, SearchInput, Avatar, Pagination, type TableColumn } from '@/components/ui';

export default function VoterDataManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedAttributes, setEditedAttributes] = useState<Record<string, string | number>>({});
  const [editedCategory, setEditedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchVoters = async (page: number = currentPage, searchQuery: string = search, pageLimit: number = limit) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('role', 'voter');
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', String(page));
      params.set('limit', String(pageLimit));

      const res = await fetch(`/api/users?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setUsers(json.data);
        setTotalPages(json.pagination?.totalPages || 1);
        setTotalItems(json.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Gagal memuat pemilih:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaticMeta = async () => {
    try {
      const [attrsRes, catsRes] = await Promise.all([
        fetch('/api/attributes'),
        fetch('/api/categories'),
      ]);
      const attrsJson = await attrsRes.json();
      const catsJson = await catsRes.json();
      if (attrsJson.success && attrsJson.data) setAttributes(attrsJson.data);
      if (catsJson.success && catsJson.data) setCategories(catsJson.data);
    } catch (err) {
      console.error('Gagal memuat metadata:', err);
    }
  };

  useEffect(() => {
    fetchStaticMeta();
    fetchVoters(1, '', limit);
  }, []);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchVoters(1, search, limit);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setEditedAttributes({ ...(user.attributes || {}) });
    setEditedCategory(user.category || '');
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attributes: editedAttributes, category: editedCategory }),
      });
      const json = await res.json();

      if (json.success) {
        showNotification(`Data atribut ${selectedUser.name} berhasil diperbarui.`);
        setEditModalOpen(false);
        setSelectedUser(null);
        fetchVoters(currentPage, search, limit);
      } else {
        alert(json.message || 'Gagal memperbarui data pemilih');
      }
    } catch (err) {
      alert('Gagal menghubungkan ke server');
    } finally {
      setSaving(false);
    }
  };

  const handleAttributeChange = (key: string, value: string | number) => {
    setEditedAttributes(prev => ({ ...prev, [key]: value }));
  };

  // Get label for a category key
  const getCategoryLabel = (key: string) => {
    const cat = categories.find(c => c.key === key);
    return cat?.label || key || '—';
  };

  // Filter attributes for the selected user's category
  const getFilteredAttributes = (userCategory: string) => {
    return attributes.filter(attr => {
      if (!attr.applicableTo || attr.applicableTo.length === 0) return true; // applies to all
      return attr.applicableTo.includes(userCategory);
    });
  };

  const columns: TableColumn<any>[] = [
    {
      key: 'name',
      label: 'Pemilih',
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} src={r.avatar} size="sm" />
          <div>
            <p className="font-medium text-slate-900">{r.name}</p>
            <p className="text-xs text-slate-400">{r.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Kategori',
      render: (r) => {
        const catKey = r.category || '';
        if (!catKey) return <Badge color="gray">Belum Diatur</Badge>;
        const colorMap: Record<string, 'indigo' | 'green' | 'red' | 'yellow' | 'gray' | 'blue' | 'cyan'> = { 
          mahasiswa: 'blue', 
          dosen: 'yellow', 
          staff: 'green' 
        };
        return <Badge color={colorMap[catKey] || 'indigo'}>{getCategoryLabel(catKey)}</Badge>;
      }
    },
    {
      key: 'jurusan',
      label: 'Info Utama',
      render: (r) => {
        const cat = r.category || '';
        if (cat === 'mahasiswa') {
          return (
            <div>
              <p className="text-sm text-slate-700 font-medium">{String(r.attributes?.jurusan || '—')}</p>
              <p className="text-xs text-slate-400">{String(r.attributes?.fakultas || '—')} • Angkatan {String(r.attributes?.angkatan || '—')}</p>
            </div>
          );
        } else if (cat === 'dosen' || cat === 'staff') {
          return (
            <div>
              <p className="text-sm text-slate-700 font-medium">{String(r.attributes?.jabatan || '—')}</p>
              <p className="text-xs text-slate-400">{String(r.attributes?.fakultas || r.attributes?.divisi || '—')}</p>
            </div>
          );
        }
        return <span className="text-slate-400 text-xs">—</span>;
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => {
        const val = String(r.attributes?.status_mahasiswa || r.status || 'active');
        const isActive = val === 'Aktif' || val === 'active';
        return (
          <Badge color={isActive ? 'green' : val === 'Cuti' ? 'yellow' : 'red'} dot>
            {val}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (r) => (
        <Button variant="secondary" size="sm" onClick={() => handleEditClick(r)}>
          Kelola Data
        </Button>
      )
    }
  ];

  // Attributes filtered by selected user's category (in modal)
  const modalAttributes = selectedUser ? getFilteredAttributes(editedCategory) : [];

  return (
    <div className="space-y-6">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      <PageHeader
        title="Manajemen Data Pemilih"
        subtitle="Kelola kategori dan atribut dinamis pengguna untuk validasi Voter Rule Engine"
      />

      <Card padding={false}>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari pemilih berdasarkan nama atau email..."
            />
          </div>
        </div>
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin mb-3" />
            <p className="text-sm font-medium">Memuat data pemilih...</p>
          </div>
        ) : (
          <div className="p-4">
            <Table columns={columns} data={users} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                fetchVoters(page, search, limit);
              }}
              totalItems={totalItems}
              limit={limit}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setCurrentPage(1);
                fetchVoters(1, search, newLimit);
              }}
            />
          </div>
        )}
      </Card>

      {/* Edit Attributes Modal */}
      {selectedUser && (
        <Modal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Kelola Data Pemilih: ${selectedUser.name}`}
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditModalOpen(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3 mb-2">
              <Avatar name={selectedUser.name} src={selectedUser.avatar} size="md" />
              <div>
                <p className="text-sm font-bold text-slate-800">{selectedUser.name}</p>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
              </div>
            </div>

            {/* Category Selector */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3">
              <Select
                label="Kategori Pengguna"
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value)}
                options={[
                  { value: '', label: '— Pilih Kategori —' },
                  ...categories.map(c => ({ value: c.key, label: c.label }))
                ]}
              />
              <p className="text-[11px] text-indigo-500 mt-1 font-medium">
                Mengubah kategori akan menampilkan atribut input yang sesuai di bawah.
              </p>
            </div>

            {!editedCategory && (
              <div className="py-6 text-center text-slate-400 text-sm italic border border-dashed border-slate-200 rounded-lg">
                Pilih kategori pengguna terlebih dahulu untuk melihat atribut yang tersedia.
              </div>
            )}

            {editedCategory && (
              <>
                <p className="text-xs text-slate-400 italic">
                  * Atribut di bawah ini otomatis disesuaikan dengan kategori <strong>{getCategoryLabel(editedCategory)}</strong>. Data digunakan oleh Voter Rule Engine.
                </p>

                <div className="grid grid-cols-1 gap-4 pt-2">
                  {modalAttributes.length > 0 ? modalAttributes.map((attr) => {
                    const currentVal = editedAttributes[attr.key] !== undefined ? editedAttributes[attr.key] : '';
                    return (
                      <div key={attr._id} className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700">
                          {attr.label} {attr.required && <span className="text-red-500">*</span>}
                        </label>
                        {attr.type === 'select' ? (
                          <Select
                            value={String(currentVal)}
                            onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                            options={[
                              { value: '', label: `-- Pilih ${attr.label} --` },
                              ...(attr.options || []).map((o: string) => ({ value: o, label: o }))
                            ]}
                          />
                        ) : attr.type === 'number' ? (
                          <Input
                            type="number"
                            value={currentVal}
                            onChange={(e) => handleAttributeChange(attr.key, Number(e.target.value))}
                            placeholder={`Masukkan ${attr.label.toLowerCase()}`}
                          />
                        ) : (
                          <Input
                            type="text"
                            value={String(currentVal)}
                            onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                            placeholder={`Masukkan ${attr.label.toLowerCase()}`}
                          />
                        )}
                      </div>
                    );
                  }) : (
                    <div className="py-4 text-center text-slate-400 text-sm italic">
                      Belum ada atribut yang ditargetkan ke kategori ini.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
