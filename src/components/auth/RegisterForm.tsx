'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();

  // Basic user states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('');

  // Database configuration states
  const [categories, setCategories] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Form submission and validation states
  const [userAttributes, setUserAttributes] = useState<Record<string, string | number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [settings, setSettings] = useState<any>(null);

  // Fetch categories, dynamic attributes, and settings on load
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoadingConfig(true);
        const [catRes, attrRes, settingsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/attributes'),
          fetch('/api/settings').catch(() => null),
        ]);
        const catJson = await catRes.json();
        const attrJson = await attrRes.json();
        
        if (settingsRes) {
          const settingsJson = await settingsRes.json().catch(() => null);
          if (settingsJson && settingsJson.success && settingsJson.data) {
            setSettings(settingsJson.data);
            const name = settingsJson.data.appName || 'MudaVote';
            const tag = settingsJson.data.tagline || 'Platform E-Voting Organisasi';
            document.title = `${name} — ${tag}`;
          }
        }

        if (catJson.success && catJson.data) {
          setCategories(catJson.data);
          // Set default category if available
          if (catJson.data.length > 0) {
            setCategory(catJson.data[0].key);
          }
        }
        if (attrJson.success && attrJson.data) {
          setAttributes(attrJson.data);
        }
      } catch (err) {
        console.error('Gagal memuat konfigurasi registrasi:', err);
        setErrorMsg('Gagal memuat konfigurasi pendaftaran. Silakan coba lagi.');
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []);

  // Filter attributes based on chosen category
  const filteredAttributes = attributes.filter(attr => {
    if (!attr.applicableTo || attr.applicableTo.length === 0) return true; // applies to all
    return attr.applicableTo.includes(category);
  });

  const handleAttributeChange = (key: string, value: string | number) => {
    setUserAttributes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim() || !email.trim() || !password || !category) {
      setErrorMsg('Semua data wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    // Validate required dynamic attributes
    for (const attr of filteredAttributes) {
      const val = userAttributes[attr.key];
      if (attr.required && (val === undefined || val === null || String(val).trim() === '')) {
        setErrorMsg(`Atribut "${attr.label}" wajib diisi.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          category,
          attributes: userAttributes
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSuccessMsg(json.message || 'Registrasi berhasil! Mengalihkan ke halaman masuk...');
        // Redirect to login page after 2.5 seconds
        setTimeout(() => {
          router.push('/login');
        }, 2500);
      } else {
        setErrorMsg(json.message || 'Gagal melakukan pendaftaran.');
        setSubmitting(false);
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan koneksi server.');
      setSubmitting(false);
    }
  };

  const appName = settings?.appName || 'MudaVote';
  const tagline = settings?.tagline || 'E-Voting Platform';
  const initials = appName.substring(0, 2).toUpperCase();

  return (
    <div className="max-w-md w-full space-y-6 z-10 my-8">
      {/* Logo and Header */}
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white font-black text-2xl shadow-xl shadow-indigo-500/20 mb-4 tracking-tighter">
          {initials}
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Daftar Akun <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{appName}</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Buat akun pemilih Anda untuk berpartisipasi dalam e-voting ({tagline})
        </p>
      </div>

      {/* Register Card */}
      <div className="bg-slate-800/80 border border-slate-700/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl animate-scale-in">
        
        {/* Messages */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {loadingConfig ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-t-indigo-500 border-slate-700 animate-spin mb-3" />
            <p className="text-sm font-medium">Memuat konfigurasi formulir...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="block w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="masukkan@email-anda.com"
                className="block w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                className="block w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Kategori Pengguna
              </label>
              <select
                value={category}
                onChange={e => {
                  setCategory(e.target.value);
                  setUserAttributes({}); // Clear previous attributes on switch
                }}
                className="block w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
              >
                {categories.map(cat => (
                  <option key={cat.key} value={cat.key} className="bg-slate-800 text-white">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Attributes Form Section */}
            {filteredAttributes.length > 0 && (
              <div className="border-t border-slate-700/60 pt-4 mt-2 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Detail Kriteria Kategori
                </p>
                {filteredAttributes.map(attr => {
                  const val = userAttributes[attr.key] !== undefined ? userAttributes[attr.key] : '';
                  return (
                    <div key={attr._id} className="space-y-1">
                      <label className="block text-xs font-medium text-slate-300">
                        {attr.label} {attr.required && <span className="text-red-500">*</span>}
                      </label>
                      {attr.type === 'select' ? (
                        <select
                          value={String(val)}
                          onChange={e => handleAttributeChange(attr.key, e.target.value)}
                          className="block w-full px-4 py-2 bg-slate-900/40 border border-slate-700/40 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                        >
                          <option value="" className="bg-slate-850">-- Pilih {attr.label} --</option>
                          {(attr.options || []).map((opt: string) => (
                            <option key={opt} value={opt} className="bg-slate-800">{opt}</option>
                          ))}
                        </select>
                      ) : attr.type === 'number' ? (
                        <input
                          type="number"
                          value={val}
                          onChange={e => handleAttributeChange(attr.key, Number(e.target.value))}
                          placeholder={`Masukkan ${attr.label.toLowerCase()}`}
                          className="block w-full px-4 py-2 bg-slate-900/40 border border-slate-700/40 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                        />
                      ) : (
                        <input
                          type="text"
                          value={String(val)}
                          onChange={e => handleAttributeChange(attr.key, e.target.value)}
                          placeholder={`Masukkan ${attr.label.toLowerCase()}`}
                          className="block w-full px-4 py-2 bg-slate-900/40 border border-slate-700/40 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 mt-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm transition-all duration-150 flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Mendaftarkan...</span>
                </div>
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="mt-6 text-center border-t border-slate-700/40 pt-4">
          <p className="text-xs text-slate-400">
            Sudah memiliki akun?{' '}
            <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Masuk di sini
            </a>
          </p>
        </div>
      </div>

      {/* Footer info */}
      <p className="text-center text-xs text-slate-500 mt-6">
        {appName} &copy; {new Date().getFullYear()}. All rights reserved.
      </p>
    </div>
  );
}
