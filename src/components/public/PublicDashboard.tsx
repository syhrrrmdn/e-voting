'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeroSection from './sections/HeroSection';
import AnnouncementSection from './sections/AnnouncementSection';
import HowItWorks from './sections/HowItWorks';
import SecuritySection from './sections/SecuritySection';
import FloatingElementsBackground from '@/components/ui/FloatingElementsBackground';

export default function PublicDashboard() {
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(j => {
      if (j?.success) { setSettings(j.data); document.title = `${j.data.appName || 'MudaVote'} — ${j.data.tagline || 'E-Voting'}`; }
    }).catch(() => {});
  }, []);

  const appName = settings?.appName || 'MudaVote';
  const tagline = settings?.tagline || 'Platform E-Voting Organisasi Modern & Terenkripsi';
  const goLogin = () => router.push('/login');
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="relative min-h-screen bg-[#F7F8FC] text-gray-800 overflow-hidden">
      {/* Floating Background Elements */}
      <FloatingElementsBackground />

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">{appName.substring(0, 2).toUpperCase()}</div>
            <span className="text-lg font-extrabold text-gray-900 tracking-tight">{appName}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            {[
              ['Pengumuman', 'announcements'],
              ['Panduan', 'guide'],
              ['Keamanan', 'security'],
            ].map(([l, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="hover:text-indigo-600 transition-colors duration-200 cursor-pointer">
                {l}
              </button>
            ))}
          </nav>
          <button onClick={goLogin} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Masuk Akun
          </button>
        </div>
      </header>

      <main className="relative z-10">
        <HeroSection appName={appName} tagline={tagline} onLogin={goLogin} onScroll={() => scrollTo('announcements')} />
        <AnnouncementSection />
        <HowItWorks />
        <SecuritySection />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 bg-white border-t border-gray-200 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} {appName}. Seluruh hak cipta dilindungi.</p>
      </footer>
    </div>
  );
}
