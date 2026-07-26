'use client';

import React, { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import FloatingElementsBackground from '@/components/ui/FloatingElementsBackground';

export default function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json?.success && json.data) {
          setSettings(json.data);
          const name = json.data.appName || 'MudaVote';
          const tag  = json.data.tagline || 'Platform E-Voting Organisasi';
          document.title = `${name} — ${tag}`;
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const errorType = searchParams.get('error');
    if (errorType) {
      setErrorMsg('Terjadi kesalahan saat autentikasi. Hubungi admin.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setErrorMsg('Email wajib diisi.'); return; }
    setLoading('credentials');
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorMsg(error.message === 'Invalid login credentials'
          ? 'Email atau kata sandi tidak valid. Silakan coba lagi.'
          : error.message);
        setLoading(null);
      } else {
        router.push(searchParams.get('callbackUrl') || '/');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
      setLoading(null);
    }
  };

  const appName  = settings?.appName || 'MudaVote';
  const tagline  = settings?.tagline || 'Platform E-Voting Organisasi Modern & Terenkripsi';
  const initials = appName.substring(0, 2).toUpperCase();

  return (
    <div className="relative max-w-md w-full space-y-6 z-10 my-8">
      {/* Drifting Background Spheres */}
      <FloatingElementsBackground />

      {/* Logo & Header */}
      <div className="relative z-10 text-center animate-fade-in">
        <div 
          onClick={() => router.push('/')}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl shadow-lg shadow-indigo-600/25 mb-4 tracking-tight cursor-pointer hover:scale-105 transition-transform"
        >
          {initials}
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Masuk Akun <span className="bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">{appName}</span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-500 font-medium max-w-xs mx-auto leading-relaxed">
          {tagline}
        </p>
      </div>

      {/* Transparent Glassmorphic Card (Light Theme Dashboard Style) */}
      <div className="relative z-10 bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-7 sm:p-8 shadow-xl shadow-indigo-950/5 animate-scale-in">
        
        {/* Error Notification Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-slide-in">
            <svg className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="leading-relaxed font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
          
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="masukkan@email-anda.com"
              className="block w-full px-4 py-3 bg-white/80 border border-gray-200/90 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all"
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Kata Sandi
              </label>
              <a href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                Lupa kata sandi?
              </a>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi Anda"
                className="block w-full px-4 py-3 pr-11 bg-white/80 border border-gray-200/90 rounded-2xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                aria-label="Toggle Password Visibility"
              >
                {showPw ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading !== null}
            className="w-full py-3.5 px-5 mt-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-200/60 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'credentials' ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Masuk Akun...</span>
              </div>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Back to Register Link */}
        <div className="mt-7 text-center border-t border-gray-200/70 pt-4">
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Belum memiliki akun?{' '}
            <a href="/register" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
              Daftar sekarang
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
