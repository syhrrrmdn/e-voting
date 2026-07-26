'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FloatingElementsBackground from '@/components/ui/FloatingElementsBackground';

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
  const tagline = settings?.tagline || 'Platform E-Voting Organisasi Modern & Terenkripsi';
  const initials = appName.substring(0, 2).toUpperCase();

  const inputClass = "block w-full px-4 py-3 bg-white/80 border border-gray-200/90 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all";
  const selectClass = "block w-full px-4 py-3 bg-white/80 border border-gray-200/90 rounded-2xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all";
  const labelClass = "block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5";

  return (
    <div className="relative max-w-md w-full space-y-6 z-10 my-8">
      {/* Floating Background Spheres */}
      <FloatingElementsBackground />

      {/* Logo and Header */}
      <div className="relative z-10 text-center animate-fade-in">
        <div
          onClick={() => router.push('/')}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-lg shadow-indigo-600/25 mb-4 tracking-tight cursor-pointer hover:scale-105 transition-transform"
        >
          {initials}
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Daftar Akun <span className="bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">{appName}</span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
          Buat akun pemilih untuk berpartisipasi dalam e-voting ({tagline})
        </p>
      </div>

      {/* Transparent Glassmorphic Register Card */}
      <div className="relative z-10 bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-7 sm:p-8 shadow-xl shadow-indigo-950/5 animate-scale-in">
        
        {/* Messages */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-slide-in">
            <svg className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-slide-in">
            <svg className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="leading-relaxed font-medium">{successMsg}</span>
          </div>
        )}

        {loadingConfig ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400">
            <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-gray-200 animate-spin mb-3" />
            <p className="text-sm font-medium">Memuat konfigurasi formulir...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
            
            {/* Nama Lengkap */}
            <div>
              <label className={labelClass}>Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Alamat Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="masukkan@email-anda.com"
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>Kata Sandi</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                className={inputClass}
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className={labelClass}>Kategori Pengguna</label>
              <select
                value={category}
                onChange={e => {
                  setCategory(e.target.value);
                  setUserAttributes({}); // Clear previous attributes on switch
                }}
                className={selectClass}
              >
                {categories.map(cat => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Attributes Form Section */}
            {filteredAttributes.length > 0 && (
              <div className="border-t border-gray-200/70 pt-4 mt-2 space-y-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Detail Kriteria Kategori
                </p>
                {filteredAttributes.map(attr => {
                  const val = userAttributes[attr.key] !== undefined ? userAttributes[attr.key] : '';
                  return (
                    <div key={attr._id} className="space-y-1">
                      <label className="block text-xs font-bold text-gray-600">
                        {attr.label} {attr.required && <span className="text-rose-500">*</span>}
                      </label>
                      {attr.type === 'select' ? (
                        <select
                          value={String(val)}
                          onChange={e => handleAttributeChange(attr.key, e.target.value)}
                          className={selectClass}
                        >
                          <option value="">-- Pilih {attr.label} --</option>
                          {(attr.options || []).map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : attr.type === 'number' ? (
                        <input
                          type="number"
                          value={val}
                          onChange={e => handleAttributeChange(attr.key, Number(e.target.value))}
                          placeholder={`Masukkan ${attr.label.toLowerCase()}`}
                          className={inputClass}
                        />
                      ) : (
                        <input
                          type="text"
                          value={String(val)}
                          onChange={e => handleAttributeChange(attr.key, e.target.value)}
                          placeholder={`Masukkan ${attr.label.toLowerCase()}`}
                          className={inputClass}
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
              className="w-full py-3.5 px-5 mt-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-200/60 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                <>
                  <span>Daftar Sekarang</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="mt-7 text-center border-t border-gray-200/70 pt-4">
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Sudah memiliki akun?{' '}
            <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
              Masuk di sini
            </a>
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <p className="relative z-10 text-center text-xs text-gray-400 mt-6 font-medium">
        {appName} &copy; {new Date().getFullYear()}. All rights reserved.
      </p>
    </div>
  );
}
