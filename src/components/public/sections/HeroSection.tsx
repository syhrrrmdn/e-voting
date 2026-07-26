'use client';

import React from 'react';

export default function HeroSection({
  appName,
  tagline,
  onLogin,
  onScroll,
}: {
  appName: string;
  tagline: string;
  onLogin: () => void;
  onScroll: () => void;
}) {
  return (
    <section className="relative py-8 sm:py-14 md:py-16 border-b border-gray-200/80 overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-[#F7F8FC]">
      {/* Background Soft Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] md:w-[700px] h-[300px] sm:h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse-soft" />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 relative z-10">
        {/* Static Hero Frame */}
        <div className="relative rounded-2xl sm:rounded-3xl bg-white border border-gray-200/90 shadow-lg overflow-hidden min-h-[320px] sm:min-h-[380px] md:min-h-[400px] flex flex-col justify-center select-none transition-shadow duration-500 hover:shadow-xl p-6 sm:p-12 md:p-14 text-center">
          <div className="w-full bg-[radial-gradient(ellipse_at_top,_#eef2ff_0%,_transparent_75%)] opacity-70 absolute inset-0 pointer-events-none" />

          <div className="relative z-10 my-auto">

            {/* Main Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15] max-w-3xl mx-auto">
              Suara Anda, Masa Depan {appName || 'Organisasi'}
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-xs sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed font-normal">
              {tagline || 'Platform E-Voting Organisasi Modern, Transparan & Terenkripsi'}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <button
                onClick={onLogin}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Masuk untuk Memilih</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <button
                onClick={onScroll}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border border-gray-200 font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Lihat Pengumuman</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

