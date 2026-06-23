'use client';
import React, { useState } from 'react';
import { PageHeader, Card, Table, Badge, Button, Modal, Input, Select, Toggle, type TableColumn } from '@/components/ui';
import { dummyAttributes } from '@/data/dummy';
import type { DynamicAttribute } from '@/types';

export default function DynamicAttributes() {
  const [modalOpen, setModalOpen] = useState(false);
  const [attrType, setAttrType] = useState('text');
  const [options, setOptions] = useState<string[]>(['']);
  const columns: TableColumn<DynamicAttribute>[] = [
    { key: 'label', label: 'Attribute', render: (r) => (
      <div><p className="font-medium text-slate-900">{r.label}</p><p className="text-xs text-slate-400 font-mono">{r.key}</p></div>
    )},
    { key: 'type', label: 'Tipe', render: (r) => <Badge color={r.type==='select'?'indigo':r.type==='number'?'blue':'gray'}>{r.type}</Badge> },
    { key: 'options', label: 'Options', className: 'hidden md:table-cell', render: (r) => r.options.length > 0 ? (
      <div className="flex flex-wrap gap-1">{r.options.slice(0,3).map((o,i) => <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">{o}</span>)}{r.options.length > 3 && <span className="text-xs text-slate-400">+{r.options.length-3}</span>}</div>
    ) : <span className="text-slate-400 text-xs">—</span> },
    { key: 'required', label: 'Required', render: (r) => r.required ? <Badge color="green">Ya</Badge> : <Badge color="gray">Tidak</Badge> },
    { key: 'actions', label: '', render: () => (
      <div className="flex gap-1"><Button variant="ghost" size="sm">Edit</Button><Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">Hapus</Button></div>
    )},
  ];
  return (
    <div>
      <PageHeader title="Dynamic Attributes" subtitle="Kelola atribut dinamis untuk user" action={<Button onClick={() => setModalOpen(true)} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>}>Tambah Attribute</Button>} />
      <Card padding={false}><Table columns={columns} data={dummyAttributes} /></Card>
      {/* Assign preview */}
      <Card className="mt-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Preview: Assign Attribute ke User</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dummyAttributes.map(attr => (
            <div key={attr.id}>
              {attr.type === 'select' ? (
                <Select label={attr.label} options={[{value:'',label:`Pilih ${attr.label}`}, ...attr.options.map(o => ({value:o,label:o}))]} />
              ) : attr.type === 'number' ? (
                <Input label={attr.label} type="number" placeholder={`Masukkan ${attr.label.toLowerCase()}`} />
              ) : (
                <Input label={attr.label} placeholder={`Masukkan ${attr.label.toLowerCase()}`} />
              )}
            </div>
          ))}
        </div>
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tambah Dynamic Attribute" size="md"
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button><Button onClick={() => setModalOpen(false)}>Simpan</Button></>}>
        <div className="space-y-4">
          <Input label="Key" placeholder="contoh: fakultas" />
          <Input label="Label" placeholder="contoh: Fakultas" />
          <Select label="Tipe" options={[{value:'text',label:'Text'},{value:'number',label:'Number'},{value:'select',label:'Select'}]} value={attrType} onChange={e => setAttrType(e.target.value)} />
          <Toggle checked={true} onChange={() => {}} label="Required" />
          {attrType === 'select' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Options</label>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input value={opt} onChange={e => { const n=[...options]; n[i]=e.target.value; setOptions(n); }} placeholder={`Option ${i+1}`} />
                  <Button variant="ghost" size="sm" className="text-red-500 shrink-0" onClick={() => setOptions(options.filter((_,j)=>j!==i))}>✕</Button>
                </div>
              ))}
              <Button variant="secondary" size="sm" onClick={() => setOptions([...options, ''])}>+ Tambah Option</Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
