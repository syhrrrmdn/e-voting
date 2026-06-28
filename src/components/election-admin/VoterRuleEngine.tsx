'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Button, Select, Input } from '@/components/ui';
import type { RuleGroup, RuleCondition, RuleOperator } from '@/types';

const makeId = () => Math.random().toString(36).substring(2, 9);

// --- Friendly operator options ---
const operatorOptions: { value: RuleOperator; label: string }[] = [
  { value: '=', label: 'Adalah' },
  { value: '!=', label: 'Bukan' },
  { value: 'IN', label: 'Salah satu dari' },
];


// --- Helper to build dynamic natural phrasing for checklist ---
function getPhrase(field: string, operator: string, value: string, attrs: any[], cats: any[]): string {
  const val = String(value || '…');

  if (field === 'category') {
    const catLabel = cats.find(ct => ct.key === value)?.label || val;
    if (operator === '=') return `Merupakan ${catLabel}`;
    if (operator === '!=') return `Bukan ${catLabel}`;
    return `Salah satu dari kategori ${val}`;
  }

  const attr = attrs.find(a => a.key === field);
  const fieldLabel = attr?.label || field;

  const keyLower = field.toLowerCase();
  const labelLower = fieldLabel.toLowerCase();

  if (operator === '=') {
    if (keyLower.includes('status') || labelLower.includes('status')) {
      return `Berstatus ${val}`;
    }
    if (keyLower.includes('fakultas') || labelLower.includes('fakultas')) {
      return `Berasal dari ${fieldLabel} ${val}`;
    }
    if (keyLower.includes('jurusan') || labelLower.includes('jurusan') || keyLower.includes('prodi') || labelLower.includes('prodi')) {
      return `Dari ${fieldLabel} ${val}`;
    }
    if (keyLower.includes('angkatan') || labelLower.includes('angkatan')) {
      return `Angkatan ${val}`;
    }
    if (keyLower.includes('divisi') || labelLower.includes('divisi') || keyLower.includes('departemen') || labelLower.includes('departemen')) {
      return `Dari ${fieldLabel} ${val}`;
    }
    if (keyLower.includes('jabatan') || labelLower.includes('jabatan') || keyLower.includes('posisi') || labelLower.includes('posisi')) {
      return `Menjabat sebagai ${val}`;
    }
    if (keyLower.includes('kota') || labelLower.includes('kota') || keyLower.includes('alamat') || labelLower.includes('alamat') || keyLower.includes('domisili') || labelLower.includes('domisili')) {
      return `Berdomisili di ${val}`;
    }
    return `${fieldLabel}: ${val}`;
  }

  if (operator === '!=') {
    return `${fieldLabel} bukan ${val}`;
  }

  return `${fieldLabel} salah satu dari ${val}`;
}

// Build checklist items for preview
function buildChecklist(group: RuleGroup, attrs: any[], cats: any[]): string[] {
  const items: string[] = [];

  group.conditions.forEach(c => {
    items.push(getPhrase(c.field, c.operator, c.value as string, attrs, cats));
  });

  group.groups.forEach(sub => {
    const subItems = buildChecklist(sub, attrs, cats);
    items.push(...subItems);
  });

  return items;
}

export default function VoterRuleEngine() {
  const [elections, setElections] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [ruleGroup, setRuleGroup] = useState<RuleGroup>({ id: 'rg-root', logic: 'AND', conditions: [], groups: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [eR, aR, cR] = await Promise.all([
          fetch('/api/elections'), fetch('/api/attributes'), fetch('/api/categories'),
        ]);
        const eJ = await eR.json(), aJ = await aR.json(), cJ = await cR.json();
        if (eJ.success && eJ.data) { setElections(eJ.data); if (eJ.data.length > 0) setSelectedElectionId(eJ.data[0]._id); }
        if (aJ.success && aJ.data) setAttributes(aJ.data);
        if (cJ.success && cJ.data) setCategories(cJ.data);
      } catch (_) { /* silent */ } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!selectedElectionId) return;
    const sel = elections.find(e => e._id === selectedElectionId);
    if (sel?.rules && (sel.rules.conditions || sel.rules.groups)) {
      setRuleGroup(sel.rules);
    } else {
      setRuleGroup({ id: makeId(), logic: 'AND', conditions: [], groups: [] });
    }
    setSuccess(''); setError('');
  }, [selectedElectionId, elections]);

  const attributeOptions = [
    { value: 'category', label: 'Kategori Pengguna' },
    ...attributes.map(a => ({ value: a.key, label: a.label })),
  ];

  // --- Tree mutation helpers ---
  const walk = (g: RuleGroup, id: string, fn: (g: RuleGroup) => RuleGroup): RuleGroup =>
    g.id === id ? fn(g) : { ...g, groups: g.groups.map(c => walk(c, id, fn)) };

  const setLogic = (gid: string, logic: 'AND' | 'OR') =>
    setRuleGroup(walk(ruleGroup, gid, g => ({ ...g, logic })));
  const addCond = (gid: string) =>
    setRuleGroup(walk(ruleGroup, gid, g => ({
      ...g, conditions: [...g.conditions, { id: makeId(), field: 'category', operator: '=' as RuleOperator, value: '' }]
    })));
  const updCond = (gid: string, cid: string, u: Partial<RuleCondition>) =>
    setRuleGroup(walk(ruleGroup, gid, g => ({
      ...g, conditions: g.conditions.map(c => c.id === cid ? { ...c, ...u } as RuleCondition : c)
    })));
  const rmCond = (gid: string, cid: string) =>
    setRuleGroup(walk(ruleGroup, gid, g => ({ ...g, conditions: g.conditions.filter(c => c.id !== cid) })));
  const addGrp = (gid: string) =>
    setRuleGroup(walk(ruleGroup, gid, g => ({
      ...g, groups: [...g.groups, { id: makeId(), logic: 'AND' as const, conditions: [], groups: [] }]
    })));
  const rmGrp = (pid: string, cid: string) =>
    setRuleGroup(walk(ruleGroup, pid, g => ({ ...g, groups: g.groups.filter(c => c.id !== cid) })));

  const handleSave = async () => {
    if (!selectedElectionId) return;
    setSaving(true); setSuccess(''); setError('');
    try {
      const res = await fetch(`/api/elections/${selectedElectionId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: ruleGroup }),
      });
      const j = await res.json();
      if (j.success) {
        setSuccess('Pengaturan hak pilih berhasil disimpan!');
        setElections(p => p.map(e => e._id === selectedElectionId ? { ...e, rules: ruleGroup } : e));
      } else setError(j.message || 'Gagal menyimpan');
    } catch (_) { setError('Gagal menghubungkan ke server'); }
    finally { setSaving(false); }
  };

  // Value dropdown options
  const valOpts = (field: string) => {
    if (field === 'category') return categories.map(c => ({ value: c.key, label: c.label }));
    const a = attributes.find(at => at.key === field);
    if (a?.type === 'select' && a.options?.length > 0) return a.options.map((o: string) => ({ value: o, label: o }));
    return null;
  };

  // --- Condition Row Component ---
  const ConditionRow = ({ cond, gid }: { cond: RuleCondition; gid: string }) => {
    const opts = valOpts(cond.field);
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm hover:shadow transition-shadow group">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kriteria Pemilih</span>
          <div className="flex-1" />
          <button onClick={() => rmCond(gid, cond.id)} title="Hapus kriteria ini"
            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select options={attributeOptions} value={cond.field}
            onChange={e => updCond(gid, cond.id, { field: e.target.value, value: '' })} />
          <Select options={operatorOptions} value={cond.operator}
            onChange={e => updCond(gid, cond.id, { operator: e.target.value as RuleOperator })} />
          {opts ? (
            <Select options={[{ value: '', label: '— Pilih —' }, ...opts]} value={cond.value as string}
              onChange={e => updCond(gid, cond.id, { value: e.target.value })} />
          ) : (
            <Input placeholder={cond.operator === 'IN' ? 'Contoh: 2022, 2023' : 'Masukkan nilai…'}
              value={cond.value as string}
              onChange={e => updCond(gid, cond.id, { value: e.target.value })} />
          )}
        </div>
      </div>
    );
  };

  // --- Group Component ---
  const GroupBlock = ({ group, parentId, depth = 0 }: { group: RuleGroup; parentId?: string; depth?: number }) => {
    const isRoot = !parentId;
    const empty = group.conditions.length === 0 && group.groups.length === 0;
    const bgClass = depth % 2 === 0 ? 'bg-slate-50/70 border-slate-200' : 'bg-indigo-50/30 border-indigo-200';

    return (
      <div className={`border rounded-2xl p-4 sm:p-5 space-y-3 ${bgClass}`}>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              {isRoot ? 'Mode Pencocokan Aturan:' : 'Kelompok Pemilih:'}
            </span>
            <div className="flex rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <button onClick={() => setLogic(group.id, 'AND')}
                className={`px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${group.logic === 'AND' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                Semua kriteria harus terpenuhi
              </button>
              <button onClick={() => setLogic(group.id, 'OR')}
                className={`px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${group.logic === 'OR' ? 'bg-amber-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                Cukup salah satu kriteria terpenuhi
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => addCond(group.id)}>+ Tambahkan Kriteria</Button>
            <Button variant="ghost" size="sm" onClick={() => addGrp(group.id)}>+ Kelompok Pemilih</Button>
            {parentId && (
              <button onClick={() => rmGrp(parentId, group.id)}
                className="text-xs text-red-400 hover:text-red-600 font-semibold cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* Empty */}
        {empty && (
          <div className="text-center py-8 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm font-medium text-slate-500">Belum ada kriteria pemilih</p>
            <p className="text-xs mt-1 text-slate-400">Klik <strong>&quot;+ Tambahkan Kriteria&quot;</strong> untuk menentukan siapa yang berhak memilih</p>
          </div>
        )}

        {/* Conditions */}
        {group.conditions.length > 0 && (
          <div className="space-y-2">
            {group.conditions.map((c, i) => (
              <React.Fragment key={c.id}>
                <ConditionRow cond={c} gid={group.id} />
                {i < group.conditions.length - 1 && (
                  <div className="flex justify-center">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-0.5 rounded-full ${group.logic === 'AND' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                      {group.logic === 'AND' ? 'dan' : 'atau'}
                    </span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Connector */}
        {group.conditions.length > 0 && group.groups.length > 0 && (
          <div className="flex justify-center">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-0.5 rounded-full ${group.logic === 'AND' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
              {group.logic === 'AND' ? 'dan' : 'atau'}
            </span>
          </div>
        )}

        {/* Sub-groups */}
        {group.groups.map(sub => (
          <GroupBlock key={sub.id} group={sub} parentId={group.id} depth={depth + 1} />
        ))}
      </div>
    );
  };

  // --- Loading ---
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin mb-3" />
        <p className="text-sm font-medium">Memuat pengaturan hak pilih…</p>
      </div>
    );
  }

  const hasRules = ruleGroup.conditions.length > 0 || ruleGroup.groups.length > 0;
  const checklist = hasRules ? buildChecklist(ruleGroup, attributes, categories) : [];
  const selectedElection = elections.find(e => e._id === selectedElectionId);

  return (
    <div>
      <PageHeader title="Pengaturan Hak Pilih" subtitle="Tentukan siapa saja yang dapat mengikuti pemilihan ini berdasarkan kriteria tertentu." />

      {/* Election picker */}
      <Card className="mb-6">
        <div className="max-w-sm">
          <Select label="Pilih Pemilihan" options={elections.map(e => ({ value: e._id, label: e.title }))}
            value={selectedElectionId} onChange={e => setSelectedElectionId(e.target.value)} />
        </div>
      </Card>

      {/* Messages */}
      {success && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </div>
      )}

      {elections.length === 0 ? (
        <Card className="py-12 text-center text-slate-400">Belum ada pemilihan. Buat pemilihan terlebih dahulu.</Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Rule Builder */}
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedElection?.title || 'Pemilihan'}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Tambahkan kriteria untuk membatasi siapa yang boleh memilih.</p>
                </div>
                <Button size="sm" variant="success" onClick={handleSave} disabled={saving}>
                  {saving ? 'Menyimpan…' : 'Simpan Pengaturan'}
                </Button>
              </div>
              <GroupBlock group={ruleGroup} />
            </Card>
          </div>

          {/* Right: Ringkasan Hak Pilih */}
          <div>
            <Card className="sticky top-20">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <h4 className="text-sm font-bold text-slate-900">Ringkasan Hak Pilih</h4>
              </div>

              {hasRules ? (
                <div className="space-y-4">
                  {/* Checklist */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pemilih yang memenuhi:</p>
                    <div className="space-y-1.5">
                      {checklist.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[11px] text-slate-400">
                        Aturan pencocokan: <span className="font-semibold text-slate-600">{ruleGroup.logic === 'AND' ? 'Semua kriteria harus terpenuhi' : 'Cukup salah satu kriteria terpenuhi'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-sm font-semibold text-emerald-700">Terbuka untuk Semua</p>
                  <p className="text-xs text-slate-400 mt-1">Semua pemilih terdaftar berhak memberikan suara.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
