'use client';

import React from 'react';

export default function StatsBar({
  stats,
}: {
  stats: {
    activeElectionsCount: number;
    totalVotersCount: number;
    totalVotesCastCount: number;
    turnoutRate: number;
  };
}) {
  const items = [
    {
      label: 'Pemilihan Aktif',
      value: String(stats.activeElectionsCount),
      sub: 'event berlangsung',
      badge: 'Live',
      color: 'border-emerald-200 text-emerald-700 bg-emerald-50',
    },
    {
      label: 'Partisipasi Pemilih',
      value: `${stats.turnoutRate}%`,
      sub: 'voter turnout rate',
      badge: 'Real-time',
      color: 'border-teal-200 text-teal-700 bg-teal-50',
    },
    {
      label: 'Suara Masuk',
      value: stats.totalVotesCastCount.toLocaleString('id-ID'),
      sub: 'suara sah tercatat',
      badge: 'Terenkripsi',
      color: 'border-indigo-200 text-indigo-700 bg-indigo-50',
    },
    {
      label: 'Pemilih Terdaftar',
      value: stats.totalVotersCount.toLocaleString('id-ID'),
      sub: 'DPT aktif terverifikasi',
      badge: 'Terverifikasi',
      color: 'border-purple-200 text-purple-700 bg-purple-50',
    },
  ];

  return (
    <section id="stats" className="py-10 border-b border-gray-200/80 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {items.map((it) => (
          <div
            key={it.label}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{it.label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${it.color}`}>
                  {it.badge}
                </span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                {it.value}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-medium">{it.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
