'use client';

import React from 'react';

interface Candidate {
  _id: string;
  name: string;
  candidateNumber: number;
  voteCount?: number;
}

interface Election {
  _id: string;
  title: string;
  totalVotes: number;
  candidates: Candidate[];
}

export default function PublicResults({ elections }: { elections: Election[] }) {
  return (
    <section id="results" className="py-14 sm:py-16 bg-white border-y border-gray-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Hasil Pemilihan Resmi</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Rekapitulasi perolehan suara sah publik untuk event pemilihan yang telah selesai.
          </p>
        </div>

        {elections.length === 0 ? (
          <div className="p-8 rounded-2xl bg-gray-50 border border-gray-200 text-center max-w-md mx-auto text-xs sm:text-sm text-gray-500 shadow-xs">
            Hasil pemilihan aktif akan dipublikasikan secara otomatis setelah waktu pemungutan suara berakhir.
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {elections.map((el) => {
              const total = el.totalVotes || 1;
              return (
                <div key={el._id} className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{el.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Total Suara Sah: {el.totalVotes.toLocaleString('id-ID')}</p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Resmi
                    </span>
                  </div>

                  <div className="space-y-4">
                    {el.candidates?.map((c) => {
                      const count = c.voteCount || 0;
                      const pct = Math.round((count / total) * 100) || 0;
                      return (
                        <div key={c._id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="font-semibold text-gray-900">
                              #{c.candidateNumber} {c.name}
                            </span>
                            <span className="text-gray-500 font-mono text-xs">
                              {count} suara ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
