'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />

    <div className="max-w-md w-full space-y-8 z-10">
      {/* Header */}
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white font-black text-2xl shadow-xl shadow-indigo-500/20 mb-4 tracking-tighter">
          {initials}
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Lupa <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Kata Sandi</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Masukkan email Anda untuk mereset kata sandi akun {appName}
        </p>
      </div>

      {/* Card */}
      <div className="bg-slate-800/80 border border-slate-700/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl animate-scale-in">
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

        {!successMsg && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Alamat Email Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                  className="block w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm transition-all duration-150 flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer bg-transparent border-none"
          >
            &larr; Kembali ke halaman login
          </button>
        </div>
      </div>

      {/* Footer info */}
      <p className="text-center text-xs text-slate-500 mt-6">
        {appName} &copy; {new Date().getFullYear()}. All rights reserved.
      </p>
    </div>
    </div>
  );
}
