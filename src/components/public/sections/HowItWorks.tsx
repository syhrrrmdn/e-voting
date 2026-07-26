'use client';

import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Autentikasi Akun',
      desc: 'Masuk menggunakan kredensial resmi terdaftar yang telah diverifikasi oleh panitia pemilihan.',
      icon: (
        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Pelajari Kandidat',
      desc: 'Tinjau visi, misi, serta rencana program kerja dari tiap pasangan calon secara seksama.',
      icon: (
        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Berikan Hak Suara',
      desc: 'Pilih kandidat pilihan Anda dan konfirmasi voting secara aman, rahasia, dan terenkripsi.',
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      num: '04',
      title: 'Verifikasi Audit Log',
      desc: 'Dapatkan token verifikasi kriptografis sebagai bukti bahwa suara Anda telah dihitung sah.',
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="guide" className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-xl mx-auto mb-12 sm:mb-14">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Langkah Sederhana</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">Panduan Alur E-Voting</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Ikuti 4 tahapan mudah untuk menyalurkan suara Anda secara resmi.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s) => (
          <div
            key={s.num}
            className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                {s.icon}
              </div>
              <span className="text-2xl font-black text-gray-300 group-hover:text-indigo-600/30 transition-colors font-mono">
                {s.num}
              </span>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{s.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
