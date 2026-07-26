'use client';

import React, { useState } from 'react';

interface Candidate {
  _id: string;
  name: string;
  vision?: string;
  mission?: string;
  photoUrl?: string;
  candidateNumber: number;
}

interface Election {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'upcoming' | 'closed' | 'draft';
  totalVotes: number;
  candidates: Candidate[];
}

export default function ElectionsGrid({
  elections,
  loading,
  onLogin,
}: {
  elections: Election[];
  loading: boolean;
  onLogin: () => void;
}) {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'upcoming' | 'closed'>('all');
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);

  const tabs = [
    { id: 'all', label: 'Semua' },
    { id: 'active', label: 'Aktif' },
    { id: 'upcoming', label: 'Mendatang' },
    { id: 'closed', label: 'Selesai' },
  ] as const;

  const activeIndex = tabs.findIndex((t) => t.id === filterTab);

  const filtered = elections.filter((e) => {
    if (filterTab === 'all') return true;
    return e.status === filterTab;
  });

  return (
    <section id="elections" className="py-14 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Pemilihan</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Event pemungutan suara resmi yang terdaftar di sistem.</p>
        </div>

        {/* Sliding Segmented Control */}
        <div className="relative flex items-center bg-white p-1 rounded-xl border border-gray-200 shadow-xs self-start sm:self-auto min-w-[300px]">
          {/* Animated Sliding Pill Highlight */}
          <div
            className="absolute top-1 bottom-1 bg-indigo-600 rounded-lg shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
            style={{
              width: `calc((100% - 8px) / ${tabs.length})`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />

          {tabs.map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`relative z-10 flex-1 py-1.5 text-xs font-semibold text-center transition-colors duration-200 cursor-pointer ${
                  isActive ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-52 rounded-2xl bg-white border border-gray-200 animate-pulse shadow-xs" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-white border border-gray-200 text-gray-400 text-xs sm:text-sm shadow-xs animate-fade-in">
          Belum ada event pemilihan dalam kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-all duration-300">
          {filtered.map((el, idx) => {
            const isActive = el.status === 'active';
            const isClosed = el.status === 'closed';
            return (
              <div
                key={el._id}
                className={`bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-gray-300 hover:shadow-md transition-all duration-300 animate-fade-in stagger-${(idx % 5) + 1}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isClosed
                          ? 'bg-gray-100 text-gray-600 border-gray-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {isActive ? 'Berlangsung' : isClosed ? 'Selesai' : 'Mendatang'}
                    </span>
                    <span className="text-[11px] font-medium text-gray-400">{el.candidates?.length || 0} Kandidat</span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-1">{el.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                    {el.description || 'Pemilihan umum resmi organisasi.'}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-gray-100">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-3">
                    <span>Berakhir:</span>
                    <span className="font-semibold text-gray-700">
                      {new Date(el.endTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedElection(el)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Lihat Kandidat
                    </button>
                    <button
                      onClick={onLogin}
                      className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
                    >
                      Vote
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Modal */}
      {selectedElection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[85vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Detail Kandidat</span>
                <h3 className="text-base font-bold text-gray-900 mt-0.5">{selectedElection.title}</h3>
              </div>
              <button
                onClick={() => setSelectedElection(null)}
                className="text-gray-400 hover:text-gray-600 text-sm cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {selectedElection.candidates && selectedElection.candidates.length > 0 ? (
                selectedElection.candidates.map((c) => (
                  <div key={c._id} className="p-4 rounded-xl bg-gray-50/70 border border-gray-200/80">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                        #{c.candidateNumber}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900">{c.name}</h4>
                    </div>
                    {c.vision && (
                      <div className="mt-2 text-xs">
                        <span className="font-semibold text-gray-600">Visi: </span>
                        <span className="text-gray-700 italic">"{c.vision}"</span>
                      </div>
                    )}
                    {c.mission && (
                      <div className="mt-1 text-xs">
                        <span className="font-semibold text-gray-600">Misi: </span>
                        <span className="text-gray-700">{c.mission}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Belum ada kandidat terdaftar.</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => {
                  setSelectedElection(null);
                  onLogin();
                }}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs cursor-pointer shadow-xs"
              >
                Masuk untuk Vote
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
