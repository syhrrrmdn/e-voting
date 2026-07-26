'use client';

import React, { useRef } from 'react';
import { Modal, Button, Badge } from '@/components/ui';

interface ElectionReportModalProps {
  open: boolean;
  onClose: () => void;
  election: any;
  candidates: any[];
}

export default function ElectionReportModal({
  open,
  onClose,
  election,
  candidates = [],
}: ElectionReportModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!open || !election) return null;

  // Filter & sort candidates for this election
  const electionCandidates = candidates.filter(
    (c) => c.electionId === election._id || c.electionId === election.id
  );
  const totalVotes = electionCandidates.reduce(
    (s, c) => s + (c.voteCount || 0),
    0
  );
  const sortedCandidates = [...electionCandidates].sort(
    (a, b) => (b.voteCount || 0) - (a.voteCount || 0)
  );

  const isZeroVotes = totalVotes === 0;
  const maxVotes = sortedCandidates.length > 0 ? (sortedCandidates[0].voteCount || 0) : 0;
  const topTiedCandidates = sortedCandidates.filter((c) => (c.voteCount || 0) === maxVotes);
  const isTie = totalVotes > 0 && topTiedCandidates.length > 1;

  const isInvalidElection = isZeroVotes || isTie;

  const winner = !isInvalidElection && sortedCandidates.length > 0 ? sortedCandidates[0] : null;
  const winnerPct =
    winner && totalVotes > 0
      ? (((winner.voteCount || 0) / totalVotes) * 100).toFixed(1)
      : '0';

  const docYear = new Date(election.endTime || Date.now()).getFullYear();
  const docMonth = (new Date(election.endTime || Date.now()).getMonth() + 1).toString().padStart(2, '0');
  const electionIdShort = (election._id || election.id || '00000').slice(-6).toUpperCase();
  const documentNo = `BA-EVOTE/${docYear}/${docMonth}/${electionIdShort}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Laporan Resmi PDF — ${election.title}`}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full no-print">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Pilih <strong>"Simpan sebagai PDF"</strong> pada browser untuk mengunduh berkas PDF resmi.
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" onClick={onClose}>
              Tutup
            </Button>
            <Button variant="primary" onClick={handlePrint} icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            }>
              Cetak / Simpan PDF
            </Button>
          </div>
        </div>
      }
    >
      <div 
        ref={printRef} 
        className="print-report-container bg-white text-slate-900 p-8 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden font-sans"
      >
        {/* Top Decorative Border Banner */}
        <div className="h-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 -mx-8 -mt-8 mb-6" />

        {/* Header Kop Surat Resmi */}
        <div className="border-b-4 border-double border-slate-900 pb-5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Emblem Logo */}
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-indigo-50 shrink-0">
                V
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-950 tracking-tight uppercase leading-none">
                  PANITIA PEMILIHAN ELEKTRONIK
                </h1>
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-widest mt-1">
                  SISTEM PEMILU DIGITAL &amp; REKAPITULASI ORGANISASI (MUDAVOTE)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Dokumen Resmi Berita Acara Rekapitulasi Suara Terverifikasi
                </p>
              </div>
            </div>

            {/* Document Status Stamp */}
            <div className="text-right shrink-0">
              {isZeroVotes ? (
                <div className="inline-flex flex-col items-end">
                  <span className="px-3.5 py-1.5 bg-red-100 text-red-700 border-2 border-red-600 text-xs font-black rounded-lg uppercase tracking-wider shadow-sm">
                    ⚠️ PEMILIHAN TIDAK SAH (0 SUARA)
                  </span>
                  <span className="text-[10px] text-red-600 font-bold mt-1">0 Partisipasi Suara</span>
                </div>
              ) : isTie ? (
                <div className="inline-flex flex-col items-end">
                  <span className="px-3.5 py-1.5 bg-red-100 text-red-700 border-2 border-red-600 text-xs font-black rounded-lg uppercase tracking-wider shadow-sm">
                    ⚠️ PEMILIHAN TIDAK SAH (SERI / IMBANG)
                  </span>
                  <span className="text-[10px] text-red-600 font-bold mt-1">{maxVotes} Suara Imbang</span>
                </div>
              ) : (
                <div className="inline-flex flex-col items-end">
                  <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 border-2 border-emerald-600 text-xs font-black rounded-lg uppercase tracking-wider shadow-sm">
                    ✓ SELESAI (SAH &amp; FINAL)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">{documentNo}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 text-center">
            <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
              BERITA ACARA REKAPITULASI &amp; PENETAPAN HASIL PEMILIHAN
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Nomor Registrasi Dokumen: <span className="font-mono font-bold text-slate-800">{documentNo}</span>
            </p>
          </div>
        </div>

        {/* Informasi Kegiatan Pemilihan */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Nama Pemilihan</span>
            <p className="text-sm font-black text-slate-900 mt-0.5">{election.title}</p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status Keabsahan</span>
            <div className="mt-1">
              {isZeroVotes ? (
                <Badge color="red">TIDAK SAH (0 Suara)</Badge>
              ) : isTie ? (
                <Badge color="red">TIDAK SAH (Hasil Imbang)</Badge>
              ) : (
                <Badge color="green">RESMI &amp; SAH</Badge>
              )}
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Periode Pemungutan Suara</span>
            <p className="font-semibold text-slate-800 mt-0.5">
              {new Date(election.startTime).toLocaleString('id-ID')} — {new Date(election.endTime).toLocaleString('id-ID')}
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Total Partisipasi Suara</span>
            <p className={`text-sm font-black mt-0.5 ${isInvalidElection ? 'text-red-600' : 'text-indigo-700'}`}>
              {totalVotes.toLocaleString()} Suara Masuk
            </p>
          </div>
          {election.description && (
            <div className="col-span-2 pt-3 border-t border-slate-200">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Deskripsi Pemilihan</span>
              <p className="text-slate-700 mt-0.5 leading-relaxed">{election.description}</p>
            </div>
          )}
        </div>

        {/* Dynamic Banner Status: Invalid vs Valid Winner */}
        {isInvalidElection ? (
          <div className="mb-6 p-5 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-4 text-red-950">
            <div className="w-11 h-11 bg-red-600 text-white rounded-xl flex items-center justify-center font-black text-xl shrink-0 shadow-md">
              !
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-200 text-red-900 text-[10px] font-black rounded uppercase tracking-wider">
                  PERNYATAAN PEMILIHAN TIDAK SAH
                </span>
                <span className="text-xs font-bold text-red-700">
                  {isZeroVotes ? '0 Partisipan Suara' : `Suara Imbang (${maxVotes} Suara)`}
                </span>
              </div>
              <h3 className="text-base font-black text-red-900 mt-1">
                PEMILIHAN DITETAPKAN TIDAK SAH ({isZeroVotes ? '0 SUARA' : 'HASIL IMBANG / SERI'})
              </h3>
              <p className="text-xs text-red-800 leading-relaxed mt-1">
                {isZeroVotes
                  ? 'Berdasarkan rekapitulasi data pemungutan suara, pemilihan ini ditutup tanpa ada suara yang masuk (0 Suara). Sesuai dengan ketentuan tata tertib pemilihan, pemilihan ini dinyatakan Batal / Tidak Sah dan tidak ada kandidat yang dapat ditetapkan sebagai pemenang.'
                  : `Berdasarkan rekapitulasi data pemungutan suara, perolehan suara terbanyak bernilai imbang/seri (${maxVotes} suara). Sesuai dengan ketentuan tata tertib pemilihan, pemilihan ini dinyatakan Tidak Sah / Seri dan tidak ada pemenang tunggal yang dapat ditetapkan.`}
              </p>
            </div>
          </div>
        ) : (
          winner && (
            <div className="mb-6 p-5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-100/50 border-2 border-amber-400/80 rounded-xl flex items-center justify-between relative overflow-hidden shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 shadow-md ring-4 ring-amber-200">
                  🏆
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-400 text-amber-950 text-[10px] font-extrabold rounded uppercase tracking-wider">
                      PEMENANG TERPILIH (PEROLEHAN SUARA TERBANYAK)
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{winner.name}</h3>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{winner.description || 'Kandidat Terpilih Resmi'}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-black text-amber-900 tracking-tight">
                  {(winner.voteCount || 0).toLocaleString()} <span className="text-xs font-bold">Suara</span>
                </p>
                <p className="text-xs font-extrabold text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full inline-block mt-1">
                  {winnerPct}% Suara Total
                </p>
              </div>
            </div>
          )
        )}

        {/* Tabel Rekapitulasi Perolehan Suara */}
        <div className="mb-6">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 pb-1 border-b border-slate-300 flex items-center justify-between">
            <span>Rincian Rekapitulasi Perolehan Suara Kandidat</span>
            <span className="text-[10px] text-slate-500 font-normal">Total Candidates: {sortedCandidates.length}</span>
          </h3>

          <table className="w-full text-xs text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider font-extrabold">
                <th className="py-3 px-3 w-12 text-center border-r border-slate-700">No</th>
                <th className="py-3 px-3 border-r border-slate-700">Nama Kandidat</th>
                <th className="py-3 px-3 border-r border-slate-700">Visi &amp; Misi / Deskripsi</th>
                <th className="py-3 px-3 text-right w-28 border-r border-slate-700">Perolehan Suara</th>
                <th className="py-3 px-3 text-right w-28 border-r border-slate-700">Persentase (%)</th>
                <th className="py-3 px-3 text-center w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada kandidat terdaftar pada pemilihan ini.
                  </td>
                </tr>
              ) : (
                sortedCandidates.map((c, idx) => {
                  const pct =
                    totalVotes > 0
                      ? (((c.voteCount || 0) / totalVotes) * 100).toFixed(1)
                      : '0.0';
                  const isWinnerCandidate = idx === 0 && !isInvalidElection;

                  return (
                    <tr 
                      key={c._id || c.id || idx} 
                      className={isWinnerCandidate ? 'bg-amber-50/70 font-semibold' : idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}
                    >
                      <td className="py-3 px-3 text-center font-bold text-slate-700 border-r border-slate-200">
                        {isWinnerCandidate ? '🏆 1' : idx + 1}
                      </td>
                      <td className="py-3 px-3 border-r border-slate-200">
                        <div className="flex items-center gap-2.5">
                          {c.image && (
                            <img
                              src={c.image}
                              alt={c.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-300"
                            />
                          )}
                          <div>
                            <p className="font-extrabold text-slate-900">{c.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 border-r border-slate-200 line-clamp-2">
                        {c.description || '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-slate-900 border-r border-slate-200">
                        {(c.voteCount || 0).toLocaleString()} Suara
                      </td>
                      <td className="py-3 px-3 text-right border-r border-slate-200 font-bold">
                        <div className="flex items-center justify-end gap-2">
                          <span className={isWinnerCandidate ? 'text-amber-900 font-black' : 'text-slate-800'}>
                            {pct}%
                          </span>
                          <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full rounded-full ${isWinnerCandidate ? 'bg-amber-500' : 'bg-indigo-600'}`} 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isInvalidElection ? (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            INVALID
                          </span>
                        ) : isWinnerCandidate ? (
                          <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200 px-2 py-0.5 rounded border border-amber-300">
                            TERPILIH
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-500">
                            TIDAK TERPILIH
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Total Row */}
            <tfoot>
              <tr className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300 text-xs">
                <td colSpan={3} className="py-2.5 px-3 text-right uppercase tracking-wider border-r border-slate-200">
                  Total Suara Partisipasi:
                </td>
                <td className="py-2.5 px-3 text-right text-indigo-700 border-r border-slate-200">
                  {totalVotes.toLocaleString()} Suara
                </td>
                <td className="py-2.5 px-3 text-right border-r border-slate-200">
                  {isInvalidElection ? '0.0%' : '100.0%'}
                </td>
                <td className="py-2.5 px-3 text-center text-[10px] font-bold">
                  {isInvalidElection ? 'TIDAK SAH' : 'LENGKAP'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Visual Progress Bar Breakdown (Print Friendly) */}
        {!isInvalidElection && (
          <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
              Grafik Distribusi Perolehan Suara
            </h4>
            <div className="space-y-3">
              {sortedCandidates.map((c) => {
                const pct =
                  totalVotes > 0
                    ? (((c.voteCount || 0) / totalVotes) * 100).toFixed(1)
                    : '0';
                return (
                  <div key={c._id || c.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-900">{c.name}</span>
                      <span className="text-indigo-700 font-bold">
                        {(c.voteCount || 0).toLocaleString()} suara ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Kolom Pengesahan & Tanda Tangan */}
        <div className="mt-10 pt-6 border-t-2 border-slate-300">
          <p className="text-xs text-slate-600 mb-8 text-center italic">
            Demikian Berita Acara Rekapitulasi Hasil Pemilihan ini dibuat dan disahkan secara resmi oleh Panitia Pemilihan sesuai dengan data transaksi e-voting yang terverifikasi.
          </p>

          <div className="grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <p className="text-slate-500 font-medium mb-16">Ketua Panitia Pemilihan</p>
              <div className="w-36 mx-auto border-b border-slate-900 pb-1 font-extrabold text-slate-900">
                ( ................................... )
              </div>
              <p className="text-[10px] text-slate-400 mt-1">NIP / ID Panitia</p>
            </div>

            <div>
              <p className="text-slate-500 font-medium mb-16">Sekretaris Panitia</p>
              <div className="w-36 mx-auto border-b border-slate-900 pb-1 font-extrabold text-slate-900">
                ( ................................... )
              </div>
              <p className="text-[10px] text-slate-400 mt-1">NIP / ID Panitia</p>
            </div>

            <div>
              <p className="text-slate-500 font-medium mb-16">Saksi / Pengawas Pemilu</p>
              <div className="w-36 mx-auto border-b border-slate-900 pb-1 font-extrabold text-slate-900">
                ( ................................... )
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Tanda Tangan Saksi</p>
            </div>
          </div>
        </div>

        {/* Footnote Audit Hash & Print Timestamp */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
          <span>Digenerate otomatis oleh Sistem E-Voting Organisasi — Hash: <strong className="font-mono text-slate-600">{documentNo}</strong></span>
          <span>Dicetak: {new Date().toLocaleString('id-ID')}</span>
        </div>
      </div>
    </Modal>
  );
}
