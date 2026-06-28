'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Avatar, Badge, Input, Button } from '@/components/ui';
import { useSession, signOut } from 'next-auth/react';

export default function Profile() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState<any>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [meRes, attrRes, catRes, settingsRes] = await Promise.all([
        fetch('/api/me'),
        fetch('/api/attributes'),
        fetch('/api/categories'),
        fetch('/api/settings').catch(() => null)
      ]);
      const meJson = await meRes.json();
      const attrJson = await attrRes.json();
      const catJson = await catRes.json();

      if (settingsRes) {
        const settingsJson = await settingsRes.json().catch(() => null);
        if (settingsJson && settingsJson.success && settingsJson.data) {
          setSettings(settingsJson.data);
        }
      }

      if (meJson.success && meJson.data) {
        setProfile(meJson.data);
        setName(meJson.data.name);
      } else {
        setError(meJson.message || 'Gagal memuat profil');
      }
      if (attrJson.success && attrJson.data) {
        setAttributes(attrJson.data);
      }
      if (catJson.success && catJson.data) {
        setCategories(catJson.data);
      }
    } catch (err: any) {
      setError('Gagal menghubungkan ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal adalah 5MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Str = reader.result as string;
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64Str, folder: 'avatars' }),
        });
        const uploadJson = await uploadRes.json();

        if (uploadJson.success) {
          // Update profile in DB
          const updateRes = await fetch('/api/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatar: uploadJson.url }),
          });
          const updateJson = await updateRes.json();

          if (updateJson.success) {
            setProfile(updateJson.data);
            setSuccess('Foto profil berhasil diperbarui!');
            await update();
          } else {
            setError(updateJson.message || 'Gagal menyimpan foto profil ke database');
          }
        } else {
          setError(uploadJson.message || 'Gagal mengunggah foto ke Cloudinary');
        }
      } catch (err) {
        setError('Terjadi kesalahan saat mengunggah berkas');
      } finally {
        setUploading(false);
      }
    };
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setError('Nama tidak boleh kosong');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();

      if (json.success) {
        setProfile(json.data);
        setSuccess('Profil berhasil disimpan!');
        await update();
      } else {
        setError(json.message || 'Gagal memperbarui profil');
      }
    } catch (err) {
      setError('Gagal menghubungkan ke server');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin mb-3" />
        <p className="text-sm font-medium">Memuat profil...</p>
      </div>
    );
  }

  const user = profile || {
    name: session?.user?.name || 'User',
    email: session?.user?.email || '',
    role: (session?.user as any)?.role || 'voter',
    category: '',
    avatar: session?.user?.image || '',
    attributes: {}
  };

  const roleLabelMap: Record<string, string> = {
    admin: 'Administrator',
    election_admin: 'Admin Pemilihan',
    voter: 'Pemilih',
  };

  // Find label for voter's category
  const categoryObj = categories.find(c => c.key === user.category);
  const categoryLabel = categoryObj?.label || user.category || 'Belum Diatur';

  // Filter attributes applicable to user's category
  const filteredAttrs = attributes.filter(attr => {
    if (!attr.applicableTo || attr.applicableTo.length === 0) return true; // applies to all
    return attr.applicableTo.includes(user.category);
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader 
        title="Profil Pemilih" 
        subtitle="Kelola informasi akun dan tinjau data kriteria pemilih Anda" 
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
          {success}
        </div>
      )}

      <Card className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group shrink-0">
          <div className="relative rounded-full overflow-hidden border-4 border-white shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02]">
            <Avatar name={user.name} src={user.avatar} size="lg" />
            
            {/* Uploading Overlay Spinner */}
            {uploading ? (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-[9px] font-bold mt-1">Mengunggah</span>
              </div>
            ) : (
              /* Desktop Hover Overlay */
              <label className="absolute inset-0 bg-black/45 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[9px] font-bold">Ubah Foto</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
              </label>
            )}
          </div>

          {/* Permanent Camera Icon Badge (Bottom-Right) */}
          <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg flex items-center justify-center border-2 border-white cursor-pointer transition-all duration-200 hover:scale-110">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
          </label>
        </div>
        <div className="text-center sm:text-left flex-1 space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <Badge color="blue">{roleLabelMap[user.role] || 'Pemilih'}</Badge>
          </div>
          <p className="text-sm text-slate-500">{user.email}</p>
          {user.category && (
            <p className="text-xs text-slate-400 font-semibold">
              Kategori Pengguna: <span className="text-indigo-600 font-bold">{categoryLabel}</span>
            </p>
          )}
          <p className="text-xs text-slate-400 leading-relaxed">
            Klik foto profil atau tombol kamera untuk memilih dan mengunggah berkas foto baru (Format: JPG, PNG. Maksimal 5MB).
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dynamic User Attributes */}
        <Card>
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-base font-semibold text-slate-900">Atribut Pemilih Anda</h3>
            <Badge color={user.category ? 'indigo' : 'gray'}>{categoryLabel}</Badge>
          </div>
          
          <div className="space-y-4">
            {filteredAttrs.length > 0 ? (
              filteredAttrs.map(attr => (
                <div key={attr._id}>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {attr.label}
                  </label>
                  <Input value={String(user.attributes?.[attr.key] || '—')} disabled />
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm italic">
                Tidak ada atribut kriteria khusus untuk kategori ini.
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            * Data di atas dikelola oleh Administrator Sistem dan bersifat read-only untuk menjaga keabsahan Voter Rule Engine.
          </p>
        </Card>

        {/* Edit Profile Info */}
        <Card className="flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3">Ubah Informasi Profil</h3>
            <div className="space-y-3">
              <Input 
                label="Nama Lengkap" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Masukkan nama lengkap"
              />
              <Input 
                label="Email" 
                value={user.email} 
                disabled 
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="w-full mt-2">
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center text-xs text-slate-400">
            <span>{settings?.appName || 'MudaVote'} E-Voting</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-500 hover:bg-red-50 cursor-pointer font-semibold"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              Logout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
