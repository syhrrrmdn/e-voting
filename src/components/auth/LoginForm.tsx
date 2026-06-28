'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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

  // Capture NextAuth query errors
  useEffect(() => {
    const errorType = searchParams.get('error');
    if (errorType) {
      if (errorType === 'CredentialsSignin') {
        setErrorMsg('Gagal masuk. Pastikan email Anda sudah terdaftar di sistem.');
      } else {
        setErrorMsg('Terjadi kesalahan saat autentikasi. Silakan hubungi admin.');
      }
    }
  }, [searchParams]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Email wajib diisi');
      return;
    }

    setLoading('credentials');
    setErrorMsg(null);

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password: password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMsg(result.error);
        setLoading(null);
      } else {
        const callbackUrl = searchParams.get('callbackUrl') || '/';
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
      setLoading(null);
    }
  };

  const handleQuickLogin = async (demoEmail: string, roleKey: string) => {
    setLoading(roleKey);
    setErrorMsg(null);
    try {
      const result = await signIn('credentials', {
        email: demoEmail,
        redirect: false,
      });

      if (result?.error) {
        setErrorMsg(result.error);
        setLoading(null);
      } else {
        const callbackUrl = searchParams.get('callbackUrl') || '/';
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg('Gagal melakukan masuk cepat.');
      setLoading(null);
    }
  };

  const demoUsers = [
    {
      name: 'Andi Prasetyo',
      email: 'andi@mudavote.ac.id',
      role: 'admin',
      roleLabel: 'Admin Sistem',
      color: 'border-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
      badgeColor: 'bg-indigo-500 text-white',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
    {
      name: 'Sari Dewi',
      email: 'sari@mudavote.ac.id',
      role: 'election_admin',
      roleLabel: 'Admin Pemilihan',
      color: 'border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      badgeColor: 'bg-emerald-500 text-white',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
    {
      name: 'Budi Santoso',
      email: 'budi@mudavote.ac.id',
      role: 'voter',
      roleLabel: 'Pemilih',
      color: 'border-cyan-500 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
      badgeColor: 'bg-cyan-500 text-white',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    },
  ];

  const appName = settings?.appName || 'MudaVote';
  const tagline = settings?.tagline || 'Platform E-Voting Organisasi Modern & Aman';
  const initials = appName.substring(0, 2).toUpperCase();

  const getSplitName = (name: string) => {
    const mid = Math.ceil(name.length / 2);
    return {
      part1: name.substring(0, mid),
      part2: name.substring(mid)
    };
  };

  const { part1, part2 } = getSplitName(appName);

  return (
    <div className="max-w-md w-full space-y-8 z-10">
      {/* Logo and Header */}
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white font-black text-2xl shadow-xl shadow-indigo-500/20 mb-4 tracking-tighter">
          {initials}
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          {part1}<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{part2}</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          {tagline}
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-slate-800/80 border border-slate-700/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl animate-scale-in">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab / Form */}
        <form onSubmit={handleCredentialsLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <a href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Lupa Kata Sandi?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="block w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading !== null}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm transition-all duration-150 flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === 'credentials' ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Menghubungkan...</span>
              </div>
            ) : (
              'Masuk dengan Email'
            )}
          </button>
        </form>

        <div className="mt-4 text-center mb-8">
          <p className="text-xs text-slate-400">
            Belum punya akun?{' '}
            <a href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Daftar Sekarang
            </a>
          </p>
        </div>

        {/* Quick Demo Login Section */}
        <div className="space-y-3.5 pt-4 border-t border-slate-700/40">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demo Masuk Cepat (Seeded Accounts)</p>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {demoUsers.map((user) => (
              <button
                key={user.role}
                type="button"
                disabled={loading !== null}
                onClick={() => handleQuickLogin(user.email, user.role)}
                className={`flex items-center gap-3 w-full p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${user.color}`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-700/20 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-100 truncate leading-none mb-1">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate leading-none">{user.email}</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${user.badgeColor}`}>
                  {loading === user.role ? 'Loading...' : user.roleLabel}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <p className="text-center text-xs text-slate-500 mt-6">
        {appName} &copy; {new Date().getFullYear()}. All rights reserved.
      </p>
    </div>
  );
}
