'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Table, Badge, Button, Modal, Input, Select, Toggle, SearchInput, type TableColumn } from '@/components/ui';

// ── Color Map for Category Badges ──
const catColors: Record<string, 'indigo' | 'green' | 'red' | 'yellow' | 'gray' | 'blue' | 'cyan'> = {
  mahasiswa: 'blue', dosen: 'yellow', staff: 'green', default: 'gray'
};
const getCatColor = (key: string) => (catColors[key] || catColors.default);

export default function DynamicAttributes() {
  // ── State ──
  const [attributes, setAttributes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'attributes' | 'categories'>('attributes');

  // Attribute modal states
  const [attrModalOpen, setAttrModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<any>(null);
  const [savingAttr, setSavingAttr] = useState(false);
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');
  const [attrType, setAttrType] = useState<'text' | 'select' | 'number'>('text');
  const [options, setOptions] = useState<string[]>(['']);
  const [required, setRequired] = useState(false);
  const [applicableTo, setApplicableTo] = useState<string[]>([]);

  // Category modal states
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [savingCat, setSavingCat] = useState(false);
  const [catKey, setCatKey] = useState('');
  const [catLabel, setCatLabel] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Preview state
  const [previewCategory, setPreviewCategory] = useState<string>('');

  // ── Helpers ──
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // ── Data Fetching ──
  const fetchData = async () => {
    try {
      setLoading(true);
      const [attrRes, catRes] = await Promise.all([
        fetch('/api/attributes'),
        fetch('/api/categories'),
      ]);
      const attrJson = await attrRes.json();
      const catJson = await catRes.json();
      if (attrJson.success && attrJson.data) setAttributes(attrJson.data);
      if (catJson.success && catJson.data) {
        setCategories(catJson.data);
        if (catJson.data.length > 0 && !previewCategory) {
          setPreviewCategory(catJson.data[0].key);
        }
      }
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ══════════════════════════════════
  //  ATTRIBUTE CRUD
  // ══════════════════════════════════
  const handleOpenAddAttr = () => {
    setEditingAttr(null);
    setKey(''); setLabel(''); setAttrType('text'); setOptions(['']); setRequired(false); setApplicableTo([]);
    setAttrModalOpen(true);
  };

  const handleOpenEditAttr = (attr: any) => {
    setEditingAttr(attr);
    setKey(attr.key);
    setLabel(attr.label);
    setAttrType(attr.type);
    setOptions(attr.options?.length > 0 ? [...attr.options] : ['']);
    setRequired(attr.required);
    setApplicableTo(attr.applicableTo || []);
    setAttrModalOpen(true);
  };

  const handleSaveAttr = async () => {
    if (!key || !label) { alert('Key dan Label harus diisi!'); return; }
    const cleanedOptions = attrType === 'select' ? options.filter(o => o.trim() !== '') : [];
    setSavingAttr(true);
    try {
      const payload = { label, type: attrType, options: cleanedOptions, required, applicableTo };
      if (editingAttr) {
        const res = await fetch(`/api/attributes/${editingAttr._id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) { showNotification(`Atribut "${label}" berhasil diperbarui.`); fetchData(); }
        else alert(json.message || 'Gagal memperbarui atribut');
      } else {
        const res = await fetch('/api/attributes', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: key.toLowerCase().replace(/\s+/g, '_'), ...payload }),
        });
        const json = await res.json();
        if (json.success) { showNotification(`Atribut "${label}" berhasil ditambahkan.`); fetchData(); }
        else alert(json.message || 'Gagal menambahkan atribut');
      }
      setAttrModalOpen(false);
    } catch { alert('Gagal menghubungkan ke server'); }
    finally { setSavingAttr(false); }
  };

  const handleDeleteAttr = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus atribut ini?')) return;
    try {
      const res = await fetch(`/api/attributes/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) { showNotification('Atribut berhasil dihapus.'); fetchData(); }
      else alert(json.message || 'Gagal menghapus atribut');
    } catch { alert('Gagal menghubungkan ke server'); }
  };

  // ══════════════════════════════════
  //  CATEGORY CRUD
  // ══════════════════════════════════
  const handleOpenAddCat = () => {
    setEditingCat(null); setCatKey(''); setCatLabel(''); setCatDesc('');
    setCatModalOpen(true);
  };

  const handleOpenEditCat = (cat: any) => {
    setEditingCat(cat); setCatKey(cat.key); setCatLabel(cat.label); setCatDesc(cat.description || '');
    setCatModalOpen(true);
  };

  const handleSaveCat = async () => {
    if (!catKey || !catLabel) { alert('Key dan Label kategori harus diisi!'); return; }
    setSavingCat(true);
    try {
      if (editingCat) {
        const res = await fetch(`/api/categories/${editingCat._id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label: catLabel, description: catDesc }),
        });
        const json = await res.json();
        if (json.success) { showNotification(`Kategori "${catLabel}" berhasil diperbarui.`); fetchData(); }
        else alert(json.message || 'Gagal memperbarui kategori');
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: catKey.toLowerCase().replace(/\s+/g, '_'), label: catLabel, description: catDesc }),
        });
        const json = await res.json();
        if (json.success) { showNotification(`Kategori "${catLabel}" berhasil ditambahkan.`); fetchData(); }
        else alert(json.message || 'Gagal menambahkan kategori');
      }
      setCatModalOpen(false);
    } catch { alert('Gagal menghubungkan ke server'); }
    finally { setSavingCat(false); }
  };

  const handleDeleteCat = async (id: string, catLabel: string) => {
    if (!confirm(`Hapus kategori "${catLabel}"? Atribut yang hanya terhubung ke kategori ini akan menjadi berlaku untuk semua.`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) { showNotification('Kategori berhasil dihapus.'); fetchData(); }
      else alert(json.message || 'Gagal menghapus kategori');
    } catch { alert('Gagal menghubungkan ke server'); }
  };

  // ── Toggle category in applicableTo ──
  const toggleCategory = (catKey: string) => {
    setApplicableTo(prev =>
      prev.includes(catKey) ? prev.filter(k => k !== catKey) : [...prev, catKey]
    );
  };

  // ── Table Columns ──
  const attrColumns: TableColumn<any>[] = [
    { key: 'label', label: 'Atribut', render: (r) => (
      <div>
        <p className="font-medium text-slate-900">{r.label}</p>
        <p className="text-xs text-slate-400 font-mono">{r.key}</p>
      </div>
    )},
    { key: 'type', label: 'Tipe', render: (r) => (
      <Badge color={r.type === 'select' ? 'indigo' : r.type === 'number' ? 'blue' : 'gray'}>
        {r.type === 'select' ? 'Pilihan' : r.type === 'number' ? 'Angka' : 'Teks'}
      </Badge>
    )},
    { key: 'applicableTo', label: 'Sasaran Kategori', render: (r) => {
      const cats: string[] = r.applicableTo || [];
      if (cats.length === 0) return <Badge color="gray">Semua Kategori</Badge>;
      return (
        <div className="flex flex-wrap gap-1">
          {cats.map((c: string) => {
            const cat = categories.find(ct => ct.key === c);
            return <Badge key={c} color={getCatColor(c)}>{cat?.label || c}</Badge>;
          })}
        </div>
      );
    }},
    { key: 'options', label: 'Opsi', className: 'hidden lg:table-cell', render: (r) => r.options?.length > 0 ? (
      <div className="flex flex-wrap gap-1">
        {r.options.slice(0, 3).map((o: string, i: number) => (
          <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600 font-medium">{o}</span>
        ))}
        {r.options.length > 3 && <span className="text-xs text-slate-400 font-semibold">+{r.options.length - 3}</span>}
      </div>
    ) : <span className="text-slate-400 text-xs italic">—</span> },
    { key: 'required', label: 'Wajib', render: (r) => r.required ? <Badge color="green">Ya</Badge> : <Badge color="gray">Tidak</Badge> },
    { key: 'actions', label: 'Aksi', render: (r) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => handleOpenEditAttr(r)}>Edit</Button>
        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteAttr(r._id)}>Hapus</Button>
      </div>
    )},
  ];

  const catColumns: TableColumn<any>[] = [
    { key: 'label', label: 'Kategori', render: (r) => (
      <div className="flex items-center gap-2.5">
        <div className={`w-2.5 h-2.5 rounded-full bg-${getCatColor(r.key)}-500`} />
        <div>
          <p className="font-medium text-slate-900">{r.label}</p>
          <p className="text-xs text-slate-400 font-mono">{r.key}</p>
        </div>
      </div>
    )},
    { key: 'description', label: 'Deskripsi', render: (r) => (
      <p className="text-sm text-slate-600 max-w-xs truncate">{r.description || <span className="italic text-slate-400">—</span>}</p>
    )},
    { key: 'attrCount', label: 'Jumlah Atribut', render: (r) => {
      const count = attributes.filter(a => a.applicableTo?.length === 0 || a.applicableTo?.includes(r.key)).length;
      return <span className="font-semibold text-slate-700">{count}</span>;
    }},
    { key: 'actions', label: 'Aksi', render: (r) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => handleOpenEditCat(r)}>Edit</Button>
        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteCat(r._id, r.label)}>Hapus</Button>
      </div>
    )},
  ];

  // ── Preview: filter attributes by selected category ──
  const previewAttrs = attributes.filter(a =>
    a.applicableTo?.length === 0 || a.applicableTo?.includes(previewCategory)
  );

  // ══════════════════════════════════
  //  RENDER
  // ══════════════════════════════════
  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      <PageHeader
        title="Atribut Dinamis & Kategori Pengguna"
        subtitle="Atur kategori pengguna (Mahasiswa, Dosen, Staff, dll.) dan tentukan atribut input yang berlaku per kategori"
      />

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'categories' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Kategori Pengguna ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('attributes')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'attributes' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Atribut Dinamis ({attributes.length})
        </button>
      </div>

      {/* ── CATEGORIES TAB ── */}
      {activeTab === 'categories' && (
        <>
          <Card padding={false}>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Daftar Kategori Pengguna</h3>
                <p className="text-xs text-slate-400 mt-0.5">Setiap pengguna dapat diklasifikasikan ke dalam salah satu kategori ini</p>
              </div>
              <Button size="sm" onClick={handleOpenAddCat} icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              }>
                Tambah Kategori
              </Button>
            </div>
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin mb-3" />
                <p className="text-sm font-medium">Memuat data...</p>
              </div>
            ) : (
              <Table columns={catColumns} data={categories} />
            )}
          </Card>
        </>
      )}

      {/* ── ATTRIBUTES TAB ── */}
      {activeTab === 'attributes' && (
        <>
          <Card padding={false}>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Daftar Atribut Dinamis</h3>
                <p className="text-xs text-slate-400 mt-0.5">Atribut input data yang bisa ditargetkan ke kategori pengguna tertentu</p>
              </div>
              <Button size="sm" onClick={handleOpenAddAttr} icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              }>
                Tambah Atribut
              </Button>
            </div>
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin mb-3" />
                <p className="text-sm font-medium">Memuat atribut dinamis...</p>
              </div>
            ) : (
              <Table columns={attrColumns} data={attributes} />
            )}
          </Card>

          {/* Live Preview */}
          <Card className="border border-indigo-100 bg-indigo-50/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Pratinjau Formulir per Kategori
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Lihat input yang tampil untuk tiap jenis pengguna</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <Button
                    key={cat.key}
                    variant={previewCategory === cat.key ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setPreviewCategory(cat.key)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {previewAttrs.length > 0 ? previewAttrs.map(attr => (
                <div key={attr._id} className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {attr.label} {attr.required && <span className="text-red-500 font-bold">*</span>}
                  </label>
                  {attr.type === 'select' ? (
                    <Select label="" options={[{ value: '', label: `Pilih ${attr.label}` }, ...(attr.options || []).map((o: string) => ({ value: o, label: o }))]} />
                  ) : attr.type === 'number' ? (
                    <Input type="number" placeholder={`Masukkan ${attr.label.toLowerCase()}`} />
                  ) : (
                    <Input placeholder={`Masukkan ${attr.label.toLowerCase()}`} />
                  )}
                </div>
              )) : (
                <div className="col-span-full py-8 text-center text-slate-400 text-sm italic">
                  Tidak ada atribut untuk kategori ini. Tambahkan atribut dan targetkan ke kategori "{categories.find(c => c.key === previewCategory)?.label || previewCategory}".
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {/* ══════════════════════════════════ */}
      {/*  ATTRIBUTE MODAL                  */}
      {/* ══════════════════════════════════ */}
      <Modal
        open={attrModalOpen}
        onClose={() => setAttrModalOpen(false)}
        title={editingAttr ? 'Edit Atribut Dinamis' : 'Tambah Atribut Dinamis'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAttrModalOpen(false)}>Batal</Button>
            <Button onClick={handleSaveAttr} disabled={savingAttr}>{savingAttr ? 'Menyimpan...' : 'Simpan'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Kode Atribut (Key)"
            placeholder="contoh: status_mahasiswa"
            value={key}
            onChange={e => setKey(e.target.value)}
            disabled={!!editingAttr}
          />
          <Input
            label="Label Tampilan"
            placeholder="contoh: Status Mahasiswa"
            value={label}
            onChange={e => setLabel(e.target.value)}
          />
          <Select
            label="Tipe Data"
            options={[
              { value: 'text', label: 'Teks' },
              { value: 'number', label: 'Angka' },
              { value: 'select', label: 'Dropdown Pilihan' }
            ]}
            value={attrType}
            onChange={e => setAttrType(e.target.value as 'text' | 'select' | 'number')}
          />

          {/* Category Targeting */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Berlaku Untuk Kategori</label>
            <p className="text-xs text-slate-400 mb-2">Jika tidak ada yang dipilih, atribut berlaku untuk <strong>semua kategori</strong>.</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => {
                const isActive = applicableTo.includes(cat.key);
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => toggleCategory(cat.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {isActive && <span className="mr-1">✓</span>}
                    {cat.label}
                  </button>
                );
              })}
            </div>
            {applicableTo.length === 0 && (
              <p className="text-xs text-indigo-500 mt-1.5 font-medium">→ Berlaku untuk semua kategori pengguna</p>
            )}
          </div>

          <Toggle checked={required} onChange={setRequired} label="Atribut Wajib Diisi" />

          {attrType === 'select' && (
            <div className="border-t border-slate-100 pt-3">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Daftar Pilihan Dropdown</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={opt}
                      onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
                      placeholder={`Opsi Pilihan ${i + 1}`}
                    />
                    <Button variant="ghost" size="sm" className="text-red-500 shrink-0" onClick={() => setOptions(options.filter((_, j) => j !== i))}>✕</Button>
                  </div>
                ))}
              </div>
              <Button variant="secondary" size="sm" className="mt-3" onClick={() => setOptions([...options, ''])}>
                + Tambah Pilihan
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* ══════════════════════════════════ */}
      {/*  CATEGORY MODAL                   */}
      {/* ══════════════════════════════════ */}
      <Modal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCat ? 'Edit Kategori Pengguna' : 'Tambah Kategori Pengguna'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCatModalOpen(false)}>Batal</Button>
            <Button onClick={handleSaveCat} disabled={savingCat}>{savingCat ? 'Menyimpan...' : 'Simpan'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Kode Kategori (Key)"
            placeholder="contoh: mahasiswa"
            value={catKey}
            onChange={e => setCatKey(e.target.value)}
            disabled={!!editingCat}
          />
          <Input
            label="Label Tampilan"
            placeholder="contoh: Mahasiswa"
            value={catLabel}
            onChange={e => setCatLabel(e.target.value)}
          />
          <Input
            label="Deskripsi (opsional)"
            placeholder="Penjelasan singkat tentang kategori ini"
            value={catDesc}
            onChange={e => setCatDesc(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
