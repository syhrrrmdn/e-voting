'use client';

import React from 'react';

export default function SecuritySection() {
  const items = [
    {
      title: 'Enkripsi Suara (AES-256)',
      desc: 'Identitas pemilih dan pilihan suara dipisahkan untuk menjaga asas LUBER JURDIL secara mutlak.',
      badge: 'Kriptografi',
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      title: 'Pencegahan Double-Vote',
      desc: 'Aturan validasi otomatis database memastikan 1 akun hanya dapat memberikan tepat 1 suara sah.',
      badge: 'Integritas Data',
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Auditable Log System',
      desc: 'Setiap aktivitas dan transaksi pemungutan suara dicatat pada audit trail tanpa mengungkap identitas pilihan.',
      badge: 'Audit Trail',
      icon: (
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
  ];

  return (
    <section id="security" className="py-16 sm:py-20 bg-gray-50/60 border-t border-gray-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-xl mb-12">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Standar Keamanan Tinggi</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">Keamanan & Transparansi</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Platform ini dibangun menggunakan arsitektur keamanan berlapis yang menjamin kerahasiaan dan integritas suara.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((it) => (
            <div
              key={it.title}
              className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {it.icon}
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  {it.badge}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-emerald-700 transition-colors">{it.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
