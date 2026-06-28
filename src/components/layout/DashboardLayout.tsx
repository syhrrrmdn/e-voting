'use client';
import React, { useState, useEffect } from 'react';
import type { UserRole } from '@/types';
import { useSession, signOut } from 'next-auth/react';

// ── SVG Icons ──
const Icons = {
  dashboard: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>,
  users: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  building: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  attr: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
  election: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  audit: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  settings: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  candidate: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  rules: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
  result: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  vote: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  profile: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  menu: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>,
  close: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  chevron: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
};

// ── Menu definitions ──
interface MenuItem { key: string; label: string; icon: React.ReactNode; }

const adminMenu: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
  { key: 'users', label: 'Pengguna', icon: Icons.users },
  { key: 'attributes', label: 'Atribut Dinamis', icon: Icons.attr },
  { key: 'voter_data', label: 'Data Pemilih', icon: Icons.candidate },
  { key: 'elections', label: 'Pemilihan', icon: Icons.election },
  { key: 'audit', label: 'Log Audit', icon: Icons.audit },
  { key: 'settings', label: 'Pengaturan Sistem', icon: Icons.settings },
];

const electionAdminMenu: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard Pemilihan', icon: Icons.dashboard },
  { key: 'elections', label: 'Manajemen Pemilihan', icon: Icons.election },
  { key: 'candidates', label: 'Manajemen Kandidat', icon: Icons.candidate },
  { key: 'rules', label: 'Aturan Pemilih', icon: Icons.rules },
  { key: 'results', label: 'Dashboard Hasil', icon: Icons.result },
  { key: 'audit', label: 'Log Audit', icon: Icons.audit },
];

const voterMenu: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
  { key: 'elections', label: 'Pemilihan Tersedia', icon: Icons.election },
  { key: 'voting', label: 'Pemungutan Suara', icon: Icons.vote },
  { key: 'results', label: 'Hasil Pemilihan', icon: Icons.result },
  { key: 'profile', label: 'Profil', icon: Icons.profile },
];

const roleMenuMap: Record<UserRole, MenuItem[]> = {
  admin: adminMenu,
  election_admin: electionAdminMenu,
  voter: voterMenu,
};

const roleLabelMap: Record<UserRole, string> = {
  admin: 'Admin Sistem',
  election_admin: 'Admin Pemilihan',
  voter: 'Pemilih',
};

const roleColorMap: Record<UserRole, string> = {
  admin: 'bg-indigo-500',
  election_admin: 'bg-emerald-500',
  voter: 'bg-cyan-500',
};

// ── Sidebar Component ──
function Sidebar({ role, activePage, onNavigate, mobileOpen, onCloseMobile, settings }: {
  role: UserRole; activePage: string; onNavigate: (p: string) => void; mobileOpen: boolean; onCloseMobile: () => void; settings: any;
}) {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const userAvatar = session?.user?.image;
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'US';

  const appName = settings?.appName || 'MudaVote';
  const tagline = settings?.tagline || 'E-Voting Platform';
  const logoInitials = appName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'MV';

  const menu = roleMenuMap[role];
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onCloseMobile} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-800">
          <div 
            onClick={() => { onNavigate('dashboard'); onCloseMobile(); }}
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
              {logoInitials}
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-tight">{appName}</h1>
              <p className="text-slate-400 text-[10px] truncate max-w-[140px]">{tagline}</p>
            </div>
          </div>
          <button onClick={onCloseMobile} className="ml-auto lg:hidden text-slate-400 hover:text-white">{Icons.close}</button>
        </div>
        {/* Role badge */}
        <div className="px-5 py-3">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${roleColorMap[role]}/10`}>
            <span className={`w-2 h-2 rounded-full ${roleColorMap[role]}`} />
            <span className="text-xs font-medium text-slate-300">{roleLabelMap[role]}</span>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {menu.map((item) => {
            const active = activePage === item.key;
            return (
              <button key={item.key} onClick={() => { onNavigate(item.key); onCloseMobile(); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}>
                {item.icon}
                <span>{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            );
          })}
        </nav>
        {/* User info */}
        <div className="px-4 py-4 border-t border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-9 h-9 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {userInitials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-slate-400 truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Dashboard Layout ──
export default function DashboardLayout({ role, activePage, onNavigate, onRoleChange, children }: {
  role: UserRole; activePage: string; onNavigate: (p: string) => void; onRoleChange: (r: UserRole) => void; children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const actualRole = (session?.user as any)?.role as UserRole;
  const userName = session?.user?.name || 'User';
  const userAvatar = session?.user?.image;
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'US';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleDropdown, setRoleDropdown] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const menu = roleMenuMap[role];

  useEffect(() => {
    fetch('/api/settings')
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(json => {
        if (json && json.success && json.data) {
          setSettings(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const isActualAdmin = actualRole === 'admin';
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role={role} activePage={activePage} onNavigate={onNavigate} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} settings={settings} />
      {/* Main */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/80 h-16 flex items-center px-4 lg:px-8 gap-4">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100">{Icons.menu}</button>
          
          {/* Breadcrumb Navigation */}
          <nav className="hidden sm:flex items-center gap-1.5 text-sm">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="text-slate-400 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
            >
              {roleLabelMap[role]}
            </button>
            <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-semibold text-slate-800">
              {menu.find(m => m.key === activePage)?.label || 'Dashboard'}
            </span>
          </nav>
          
          <div className="flex-1" />
          {/* Role Badge (Switcher if Admin) */}
          <div className="relative">
            {isActualAdmin ? (
              <>
                <button onClick={() => setRoleDropdown(!roleDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                  <span className={`w-2 h-2 rounded-full ${roleColorMap[role]}`} />
                  {roleLabelMap[role]}
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${roleDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {roleDropdown && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setRoleDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-40 animate-scale-in">
                      <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ganti Peran</p>
                      {(['admin','election_admin','voter'] as UserRole[]).map(r => (
                        <button key={r} onClick={() => { onRoleChange(r); setRoleDropdown(false); }}
                          className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm transition-colors cursor-pointer ${role===r?'bg-indigo-50 text-indigo-700 font-medium':'text-slate-600 hover:bg-slate-50'}`}>
                          <span className={`w-2.5 h-2.5 rounded-full ${roleColorMap[r]}`} />
                          {roleLabelMap[r]}
                          {role===r && <svg className="w-4 h-4 ml-auto text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-sm font-medium text-slate-600">
                <span className={`w-2 h-2 rounded-full ${roleColorMap[role]}`} />
                {roleLabelMap[role]}
              </div>
            )}
          </div>
          {/* Notification bell */}
          <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {/* Logout Icon */}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600 transition-colors cursor-pointer"
            title="Keluar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          {/* Avatar */}
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {userInitials}
            </div>
          )}
        </header>
        {/* Page */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>

      {/* Floating Demo Mode / Role Switcher Panel */}
      {isActualAdmin && (
        <div className="fixed bottom-4 right-4 z-50 bg-white/95 border border-slate-200/90 shadow-2xl rounded-2xl p-3.5 flex flex-col gap-2 max-w-sm glass animate-fade-in">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Demo Sandbox</span>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">Ganti Peran</span>
          </div>
          <div className="flex gap-1.5 mt-0.5">
            {(['admin', 'election_admin', 'voter'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => onRoleChange(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all duration-200 ${
                  role === r
                    ? r === 'admin'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                      : r === 'election_admin'
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100'
                      : 'bg-cyan-600 text-white shadow-sm shadow-cyan-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {roleLabelMap[r]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
