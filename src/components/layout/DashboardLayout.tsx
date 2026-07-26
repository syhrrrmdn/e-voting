'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';

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
  announcement: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A2.5 2.5 0 013 11.2V9.8a2.5 2.5 0 012.39-2.497l.135-.003H8.5m10 4.5a3 3 0 01-3 3h-2.17l-3.33 3.33" /></svg>,
  rules: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
  result: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  vote: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  profile: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  menu: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>,
  close: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  chevron: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
  logout: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

interface MenuItem { key: string; label: string; icon: React.ReactNode; }

const adminMenu: MenuItem[] = [
  { key: 'dashboard',   label: 'Dashboard',         icon: Icons.dashboard },
  { key: 'users',       label: 'Pengguna',           icon: Icons.users },
  { key: 'attributes',  label: 'Atribut Dinamis',    icon: Icons.attr },
  { key: 'voter_data',  label: 'Data Pemilih',       icon: Icons.candidate },
  { key: 'elections',   label: 'Pemilihan',          icon: Icons.election },
  { key: 'announcements', label: 'Pengumuman Resmi', icon: Icons.announcement },
  { key: 'audit',       label: 'Log Audit',          icon: Icons.audit },
  { key: 'settings',    label: 'Pengaturan Sistem',  icon: Icons.settings },
];

const electionAdminMenu: MenuItem[] = [
  { key: 'dashboard',   label: 'Dashboard Pemilihan',  icon: Icons.dashboard },
  { key: 'elections',   label: 'Manajemen Pemilihan',  icon: Icons.election },
  { key: 'candidates',  label: 'Manajemen Kandidat',   icon: Icons.candidate },
  { key: 'announcements', label: 'Pengumuman Resmi',   icon: Icons.announcement },
  { key: 'rules',       label: 'Aturan Pemilih',       icon: Icons.rules },
  { key: 'results',     label: 'Dashboard Hasil',      icon: Icons.result },
  { key: 'audit',       label: 'Log Audit',            icon: Icons.audit },
];

const voterMenu: MenuItem[] = [
  { key: 'dashboard',  label: 'Dashboard',           icon: Icons.dashboard },
  { key: 'elections',  label: 'Pemilihan Tersedia',  icon: Icons.election },
  { key: 'voting',     label: 'Pemungutan Suara',    icon: Icons.vote },
  { key: 'results',    label: 'Hasil Pemilihan',     icon: Icons.result },
  { key: 'profile',    label: 'Profil',              icon: Icons.profile },
];

const roleMenuMap: Record<UserRole, MenuItem[]> = {
  admin:          adminMenu,
  election_admin: electionAdminMenu,
  voter:          voterMenu,
};

const roleLabelMap: Record<UserRole, string> = {
  admin:          'Admin Sistem',
  election_admin: 'Admin Pemilihan',
  voter:          'Pemilih',
};

// role accent colors (dot / badge indicator)
const roleAccentMap: Record<UserRole, string> = {
  admin:          'bg-indigo-500',
  election_admin: 'bg-teal-500',
  voter:          'bg-blue-400',
};

const roleBgMap: Record<UserRole, string> = {
  admin:          'bg-indigo-50 text-indigo-700',
  election_admin: 'bg-teal-50 text-teal-700',
  voter:          'bg-blue-50 text-blue-700',
};

// ── Sidebar ──────────────────────────────────────
function Sidebar({ role, activePage, onNavigate, mobileOpen, onCloseMobile, settings }: {
  role: UserRole; activePage: string; onNavigate: (p: string) => void;
  mobileOpen: boolean; onCloseMobile: () => void; settings: any;
}) {
  const { user: authUser, signOut } = useAuth();
  const userName    = authUser?.name  || 'User';
  const userEmail   = authUser?.email || '';
  const userAvatar  = authUser?.image;
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'US';

  const appName      = settings?.appName || 'MudaVote';
  const tagline      = settings?.tagline || 'E-Voting Platform';
  const logoInitials = appName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'MV';
  const menu         = roleMenuMap[role];

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={onCloseMobile} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30 flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0 !z-50' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-gray-100">
          <div
            onClick={() => { onNavigate('dashboard'); onCloseMobile(); }}
            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {logoInitials}
            </div>
            <div className="min-w-0">
              <h1 className="text-gray-900 font-bold text-sm tracking-tight truncate">{appName}</h1>
              <p className="text-gray-400 text-[10px] truncate">{tagline}</p>
            </div>
          </div>
          <button onClick={onCloseMobile} className="ml-auto lg:hidden p-1 rounded text-gray-400 hover:text-gray-600">
            {Icons.close}
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-4 py-3 border-b border-gray-100">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${roleBgMap[role]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${roleAccentMap[role]}`} />
            {roleLabelMap[role]}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {menu.map((item) => {
            const active = activePage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { onNavigate(item.key); onCloseMobile(); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className={active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            {userAvatar ? (
              <Image src={userAvatar} alt={userName} width={32} height={32} className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                {userInitials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-100 transition-all duration-150 cursor-pointer"
          >
            {Icons.logout}
            <span>Keluar dari Sistem</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Dashboard Layout ──────────────────────────────
export default function DashboardLayout({ role, activePage, onNavigate, onRoleChange, children }: {
  role: UserRole; activePage: string; onNavigate: (p: string) => void;
  onRoleChange: (r: UserRole) => void; children: React.ReactNode;
}) {
  const { user: authUser, signOut } = useAuth();
  const actualRole         = authUser?.role as UserRole;
  const userName           = authUser?.name || 'User';
  const userAvatar         = authUser?.image;
  const userInitials       = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'US';

  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [roleDropdown, setRoleDropdown] = useState(false);
  const [settings,     setSettings]     = useState<any>(null);
  const menu = roleMenuMap[role];

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.ok ? res.json() : null)
      .then(json => { if (json?.success && json.data) setSettings(json.data); })
      .catch(() => {});
  }, []);

  const isActualAdmin = actualRole === 'admin';

  return (
    <div className="relative min-h-screen bg-[#F7F8FC] overflow-hidden">
      <Sidebar
        role={role} activePage={activePage} onNavigate={onNavigate}
        mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)}
        settings={settings}
      />

      {/* Main content */}
      <div className="relative z-10 lg:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 h-14 flex items-center px-4 lg:px-6 gap-4 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {Icons.menu}
          </button>

          {/* Breadcrumb */}
          <nav className="hidden sm:flex items-center gap-1.5 text-sm">
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-gray-400 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
            >
              {roleLabelMap[role]}
            </button>
            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-semibold text-gray-800">
              {menu.find(m => m.key === activePage)?.label || 'Dashboard'}
            </span>
          </nav>

          <div className="flex-1" />

          {/* Role switcher (admin only) */}
          <div className="relative">
            {isActualAdmin ? (
              <>
                <button
                  onClick={() => setRoleDropdown(!roleDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className={`w-2 h-2 rounded-full ${roleAccentMap[role]}`} />
                  {roleLabelMap[role]}
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${roleDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {roleDropdown && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setRoleDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 z-40 animate-scale-in">
                      <p className="px-3.5 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Ganti Tampilan Peran</p>
                      {(['admin', 'election_admin', 'voter'] as UserRole[]).map(r => (
                        <button
                          key={r}
                          onClick={() => { onRoleChange(r); setRoleDropdown(false); }}
                          className={`flex items-center gap-3 w-full px-3.5 py-2 text-sm transition-colors cursor-pointer ${
                            role === r ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${roleAccentMap[r]}`} />
                          {roleLabelMap[r]}
                          {role === r && (
                            <svg className="w-4 h-4 ml-auto text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${roleBgMap[role]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${roleAccentMap[role]}`} />
                {roleLabelMap[role]}
              </div>
            )}
          </div>

          {/* Logout icon */}
          <button
            onClick={() => signOut()}
            className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
            title="Keluar"
          >
            {Icons.logout}
          </button>

          {/* Avatar */}
          {userAvatar ? (
            <Image src={userAvatar} alt={userName} width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
              {userInitials}
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
