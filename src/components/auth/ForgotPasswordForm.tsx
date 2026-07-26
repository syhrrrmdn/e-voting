'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FloatingElementsBackground from '@/components/ui/FloatingElementsBackground';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  // Fetch settings on mount
  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(json => {
        if (json && json.success && json.data) {
          setSettings(json.data);
          const name = json.data.appName || 'MudaVote';
          const tag = json.data.tagline || 'Platform E-Voting Organisasi';
          document.title = `${name} — ${tag}`;
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Email wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Terjadi kesalahan sistem.');
      } else {
        setSuccessMsg(data.message || 'Permintaan berhasil diproses. Token reset sandi telah dihasilkan.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const appName = settings?.appName || 'MudaVote';
  const initials = appName.substring(0, 2).toUpperCase();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F7F8FC] px-4 py-12 overflow-hidden font-sans">
      {/* Floating Background Spheres */}
      <FloatingElementsBackground />

      <div className="relative z-10 max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-lg shadow-indigo-600/25 mb-4 tracking-tight cursor-pointer hover:scale-105 transition-transform"
          >
            {initials}
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Lupa <span className="bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">Kata Sandi</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
            Masukkan email Anda untuk mereset kata sandi akun {appName}
          </p>
        </div>

        {/* Transparent Glassmorphic Card */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-7 sm:p-8 shadow-xl shadow-indigo-950/5 animate-scale-in">
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

          {!successMsg && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Alamat Email Akun
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="masukkan@email-anda.com"
                    className="block w-full pl-11 pr-4 py-3 bg-white/80 border border-gray-200/90 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-200/60 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  'Kirim Tautan Reset'
                )}
              </button>
            </form>
          )}

          <div className="mt-7 text-center border-t border-gray-200/70 pt-4">
            <button
              onClick={() => router.push('/login')}
              className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-bold transition-colors cursor-pointer bg-transparent border-none"
            >
              &larr; Kembali ke halaman login
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          {appName} &copy; {new Date().getFullYear()}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
