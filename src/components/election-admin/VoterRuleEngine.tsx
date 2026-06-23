'use client';
import React, { useState } from 'react';
import { PageHeader, Card, Button, Select, Input, Badge } from '@/components/ui';
import { dummyElections, dummyAttributes } from '@/data/dummy';
import type { RuleGroup, RuleCondition, RuleOperator } from '@/types';

// Utility helper to generate unique IDs
const makeId = () => Math.random().toString(36).substring(2, 9);

export default function VoterRuleEngine() {
  const elections = dummyElections.filter(e => e.instansiId === 'inst-1');
  const [selectedElectionId, setSelectedElectionId] = useState('elec-1');
  
  // Rule Group State
  const [ruleGroup, setRuleGroup] = useState<RuleGroup>({
    id: 'rg-1',
    logic: 'AND',
    conditions: [
      { id: 'rc-1', field: 'status_mahasiswa', operator: '=', value: 'Aktif' },
      { id: 'rc-2', field: 'angkatan', operator: 'IN', value: '2022, 2023, 2024' },
    ],
    groups: [
      {
        id: 'rg-2',
        logic: 'OR',
        conditions: [
          { id: 'rc-3', field: 'fakultas', operator: '=', value: 'Teknik Informatika' },
          { id: 'rc-4', field: 'fakultas', operator: '=', value: 'Ekonomi' },
        ],
        groups: [],
      },
    ],
  });

  // Operators
  const operators: { value: RuleOperator; label: string }[] = [
    { value: '=', label: 'Equals (=)' },
    { value: '!=', label: 'Not Equals (!=)' },
    { value: 'IN', label: 'In List (IN)' },
  ];

  // Attribute Keys
  const attributeOptions = dummyAttributes.map(a => ({ value: a.key, label: `${a.label} (${a.key})` }));

  // --- Handlers ---
  const updateGroupLogic = (groupId: string, logic: 'AND' | 'OR') => {
    const update = (g: RuleGroup): RuleGroup => {
      if (g.id === groupId) return { ...g, logic };
      return { ...g, groups: g.groups.map(update) };
    };
    setRuleGroup(update(ruleGroup));
  };

  const addCondition = (groupId: string) => {
    const defaultField = dummyAttributes[0]?.key || 'fakultas';
    const newCond: RuleCondition = {
      id: makeId(),
      field: defaultField,
      operator: '=',
      value: '',
    };
    const update = (g: RuleGroup): RuleGroup => {
      if (g.id === groupId) return { ...g, conditions: [...g.conditions, newCond] };
      return { ...g, groups: g.groups.map(update) };
    };
    setRuleGroup(update(ruleGroup));
  };

  const updateCondition = (groupId: string, condId: string, updates: Partial<RuleCondition>) => {
    const update = (g: RuleGroup): RuleGroup => {
      if (g.id === groupId) {
        return {
          ...g,
          conditions: g.conditions.map(c => c.id === condId ? { ...c, ...updates } as RuleCondition : c),
        };
      }
      return { ...g, groups: g.groups.map(update) };
    };
    setRuleGroup(update(ruleGroup));
  };

  const removeCondition = (groupId: string, condId: string) => {
    const update = (g: RuleGroup): RuleGroup => {
      if (g.id === groupId) {
        return { ...g, conditions: g.conditions.filter(c => c.id !== condId) };
      }
      return { ...g, groups: g.groups.map(update) };
    };
    setRuleGroup(update(ruleGroup));
  };

  const addSubGroup = (groupId: string) => {
    const newSub: RuleGroup = {
      id: makeId(),
      logic: 'AND',
      conditions: [],
      groups: [],
    };
    const update = (g: RuleGroup): RuleGroup => {
      if (g.id === groupId) return { ...g, groups: [...g.groups, newSub] };
      return { ...g, groups: g.groups.map(update) };
    };
    setRuleGroup(update(ruleGroup));
  };

  const removeSubGroup = (parentGroupId: string, childGroupId: string) => {
    const update = (g: RuleGroup): RuleGroup => {
      if (g.id === parentGroupId) {
        return { ...g, groups: g.groups.filter(child => child.id !== childGroupId) };
      }
      return { ...g, groups: g.groups.map(update) };
    };
    setRuleGroup(update(ruleGroup));
  };

  // --- Recursive Rule Component ---
  const RenderGroup = ({ group, parentId }: { group: RuleGroup; parentId?: string }) => {
    return (
      <div className="border border-slate-200 bg-slate-50/50 p-4 sm:p-5 rounded-xl space-y-4 relative">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Grup Logika:</span>
            <div className="flex rounded-lg overflow-hidden border border-slate-200">
              <button 
                onClick={() => updateGroupLogic(group.id, 'AND')}
                className={`px-3 py-1 text-xs font-semibold transition-colors ${group.logic === 'AND' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                AND
              </button>
              <button 
                onClick={() => updateGroupLogic(group.id, 'OR')}
                className={`px-3 py-1 text-xs font-semibold transition-colors ${group.logic === 'OR' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                OR
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => addCondition(group.id)}>
              + Rule
            </Button>
            <Button variant="secondary" size="sm" onClick={() => addSubGroup(group.id)}>
              + Sub-grup
            </Button>
            {parentId && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:bg-red-50"
                onClick={() => removeSubGroup(parentId, group.id)}>
                Hapus Grup
              </Button>
            )}
          </div>
        </div>

        {/* Conditions */}
        {group.conditions.length === 0 && group.groups.length === 0 && (
          <p className="text-xs text-slate-400 italic py-2">Grup kosong. Tambah kriteria atau sub-grup di atas.</p>
        )}

        {group.conditions.length > 0 && (
          <div className="space-y-3 pl-2 border-l-2 border-indigo-200">
            {group.conditions.map((cond) => {
              // Find attribute definition to check options
              const attrDef = dummyAttributes.find(a => a.key === cond.field);
              const hasOptions = attrDef?.type === 'select' && attrDef.options.length > 0;

              return (
                <div key={cond.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="w-full sm:w-1/3">
                    <Select 
                      options={attributeOptions} 
                      value={cond.field}
                      onChange={(e) => updateCondition(group.id, cond.id, { field: e.target.value, value: '' })}
                    />
                  </div>
                  <div className="w-full sm:w-1/4">
                    <Select 
                      options={operators} 
                      value={cond.operator}
                      onChange={(e) => updateCondition(group.id, cond.id, { operator: e.target.value as RuleOperator })}
                    />
                  </div>
                  <div className="w-full sm:flex-1">
                    {hasOptions ? (
                      <Select 
                        options={attrDef.options.map(o => ({ value: o, label: o }))}
                        value={cond.value as string}
                        onChange={(e) => updateCondition(group.id, cond.id, { value: e.target.value })}
                      />
                    ) : (
                      <Input 
                        placeholder={cond.operator === 'IN' ? 'Koma terpisah (misal: 2022, 2023)' : 'Value...'} 
                        value={cond.value as string}
                        onChange={(e) => updateCondition(group.id, cond.id, { value: e.target.value })}
                      />
                    )}
                  </div>
                  <button 
                    onClick={() => removeCondition(group.id, cond.id)}
                    className="p-2.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors self-end sm:self-auto">
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Sub-groups */}
        {group.groups.length > 0 && (
          <div className="space-y-4 pl-3 sm:pl-4 border-l-2 border-slate-300">
            {group.groups.map((sub) => (
              <RenderGroup key={sub.id} group={sub} parentId={group.id} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="Voter Rule Engine" subtitle="Konfigurasi kriteria pemilih (Eligibility Engine) berbasis atribut dinamis" />

      <Card className="mb-6">
        <div className="max-w-xs">
          <Select 
            label="Pilih Election untuk Dikonfigurasi" 
            options={elections.map(e => ({ value: e.id, label: e.title }))} 
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rule Builder Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Visual Rule Builder</h3>
              <Button size="sm" variant="success">Simpan Kriteria</Button>
            </div>
            <div className="space-y-4">
              <RenderGroup group={ruleGroup} />
            </div>
          </Card>
        </div>

        {/* JSON Preview Panel */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Realtime JSON Output
              </h3>
              <Badge color="indigo">JSON</Badge>
            </div>
            <p className="text-xs text-slate-400 mb-3">Aturan di atas dikonversi ke schema JSON untuk engine validasi pemilih.</p>
            <div className="rounded-lg bg-slate-900 p-4 overflow-x-auto text-[11px] font-mono text-emerald-400 max-h-[450px]">
              <pre>{JSON.stringify(ruleGroup, null, 2)}</pre>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
