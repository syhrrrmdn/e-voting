'use client';

import React, { useState, useEffect } from 'react';
import { Badge, Modal } from '@/components/ui';
import { IAnnouncement } from '@/models/Announcement';

const categoryBadgeMap: Record<string, { color: 'red' | 'blue' | 'green' | 'yellow'; label: string }> = {
  PENTING:   { color: 'red', label: 'PENTING' },
  INFORMASI: { color: 'blue', label: 'INFORMASI' },
  PANDUAN:   { color: 'green', label: 'PANDUAN' },
  UMUM:      { color: 'yellow', label: 'BERITA' },
};

export default function AnnouncementSection() {
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<IAnnouncement | null>(null);

  useEffect(() => {
    fetch('/api/announcements')
      .then((res) => {
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          return res.json();
        }
        return null;
      })
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          setAnnouncements(json.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="announcements" className="py-12 sm:py-16 border-b border-gray-200/80 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Pusat Informasi & Pengumuman
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Pengumuman & Berita Resmi
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
              Informasi terkini, edaran penting, dan panduan teknis pemilihan yang diterbitkan oleh panitia penyelenggara.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-gray-50 border border-gray-200/80 text-center max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A2.5 2.5 0 013 11.2V9.8a2.5 2.5 0 012.39-2.497l.135-.003H8.5m10 4.5a3 3 0 01-3 3h-2.17l-3.33 3.33" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900">Belum Ada Pengumuman Resmi</h3>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              Seluruh edaran penting, pengumuman jadwal, dan berita penyelenggaraan pemilihan akan langsung ditampilkan di sini oleh panitia.
            </p>
          </div>
        ) : (
          /* Announcement Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {announcements.map((item) => {
              const badgeInfo = categoryBadgeMap[item.category || 'INFORMASI'] || categoryBadgeMap.INFORMASI;
              return (
                <div
                  key={item._id || item.id}
                  onClick={() => setSelectedAnnouncement(item)}
                  className="group relative rounded-2xl bg-white border border-gray-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  <div>
                    {/* Header Image if available */}
                    {item.imageUrl ? (
                      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-60" />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <Badge color={badgeInfo.color}>{badgeInfo.label}</Badge>
                          {item.isPinned && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-extrabold tracking-wide uppercase shadow-xs">
                              📌 Disematkan
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 pb-0 flex items-center justify-between">
                        <Badge color={badgeInfo.color}>{badgeInfo.label}</Badge>
                        {item.isPinned && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold">
                            📌 Disematkan
                          </span>
                        )}
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="p-5 sm:p-6">
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium mb-2">
                        <span>{new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>Oleh {item.authorName || 'Panitia'}</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-xs text-gray-600 line-clamp-3 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>

                  {/* Read More Trigger */}
                  <div className="px-5 sm:px-6 pb-5 pt-2 flex items-center text-xs font-bold text-indigo-600 group-hover:text-indigo-700 gap-1.5 transition-all">
                    <span>Baca Selengkapnya</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Detail Announcement */}
      {selectedAnnouncement && (
        <Modal
          open={Boolean(selectedAnnouncement)}
          onClose={() => setSelectedAnnouncement(null)}
          title={selectedAnnouncement.title}
        >
          <div className="space-y-4 pt-2">
            {/* Modal Top Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Badge color={categoryBadgeMap[selectedAnnouncement.category || 'INFORMASI']?.color || 'blue'}>
                  {categoryBadgeMap[selectedAnnouncement.category || 'INFORMASI']?.label || 'INFORMASI'}
                </Badge>
                {selectedAnnouncement.isPinned && (
                  <span className="text-amber-600 font-semibold">📌 Disematkan di atas</span>
                )}
              </div>
              <div>
                Diterbitkan pada{' '}
                <strong className="text-gray-700">
                  {new Date(selectedAnnouncement.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
              </div>
            </div>

            {/* Poster Image if available */}
            {selectedAnnouncement.imageUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100 max-h-72">
                <img
                  src={selectedAnnouncement.imageUrl}
                  alt={selectedAnnouncement.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Full Body Content */}
            <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap py-2 font-normal">
              {selectedAnnouncement.content}
            </div>

            {/* Footer Author */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>Diterbitkan oleh: <strong className="text-gray-600">{selectedAnnouncement.authorName || 'Panitia Pemilihan'}</strong></span>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
