'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FloatingElementsBackground from '@/components/ui/FloatingElementsBackground';

function ResetPasswordFormWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setErrorMsg('Token reset tidak valid atau tidak ditemukan di URL.');
      return;
    }

    if (!password) {
      setErrorMsg('Kata sandi baru wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal harus 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Terjadi kesalahan sistem.');
      } else {
        setSuccessMsg(data.message || 'Kata sandi berhasil diperbarui.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "block w-full pl-11 pr-4 py-3 bg-white/80 border border-gray-200/90 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all";

  if (!token) {
    return (
      <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-xl shadow-indigo-950/5 text-center animate-scale-in">
        <div className="text-rose-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Token Tidak Valid</h3>
        <p className="text-sm text-gray-500 mb-6">Tautan reset kata sandi tidak valid atau telah kedaluwarsa.</p>
        <button
          onClick={() => router.push('/forgot-password')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold transition cursor-pointer shadow-md shadow-indigo-200/60"
        >
          Minta Tautan Baru
        </button>
      </div>
    );
  }

  return (
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
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-700 text-sm flex flex-col gap-2 text-center shadow-xs animate-slide-in">
          <svg className="w-8 h-8 text-emerald-500 mx-auto mb-1 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-bold">{successMsg}</span>
          <span className="text-xs text-gray-500">Mengalihkan Anda ke halaman login dalam beberapa detik...</span>
        </div>
      )}

      {!successMsg && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••• (min. 6 karakter)"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Konfirmasi Kata Sandi Baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className={inputClass}
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
                <span>Memperbarui...</span>
              </div>
            ) : (
              'Perbarui Kata Sandi'
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
  );
}

export default function ResetPasswordForm() {
  const [settings, setSettings] = useState<any>(null);

  // Fetch settings on mount
  useEffect(() => {
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

  const appName = settings?.appName || 'MudaVote';
  const initials = appName.substring(0, 2).toUpperCase();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F7F8FC] px-4 py-12 overflow-hidden font-sans">
      {/* Floating Background Spheres */}
      <FloatingElementsBackground />

      <div className="relative z-10 max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-lg shadow-indigo-600/25 mb-4 tracking-tight">
            {initials}
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Atur Ulang <span className="bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">Kata Sandi</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
            Masukkan kata sandi baru untuk akun {appName} Anda
          </p>
        </div>

        <Suspense fallback={
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-xl shadow-indigo-950/5 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-gray-200 animate-spin mb-3" />
            <p className="text-sm font-medium text-gray-500">Memproses token...</p>
          </div>
        }>
          <ResetPasswordFormWrapper />
        </Suspense>

        {/* Footer Info */}
        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          {appName} &copy; {new Date().getFullYear()}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
