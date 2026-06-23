'use client';
import React, { useState } from 'react';
import { PageHeader, Card, Button, Input, Select, Toggle } from '@/components/ui';

export default function SystemSettings() {
  const [notif, setNotif] = useState(true);
  const [autoClose, setAutoClose] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  return (
    <div>
      <PageHeader title="System Settings" subtitle="Konfigurasi global sistem e-voting" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-base font-semibold text-slate-900 mb-4">General</h3>
          <div className="space-y-4">
            <Input label="Nama Platform" defaultValue="MudaVote" />
            <Input label="Tagline" defaultValue="E-Voting Multi-Instansi" />
            <Select label="Bahasa Default" options={[{value:'id',label:'Bahasa Indonesia'},{value:'en',label:'English'}]} />
            <Select label="Timezone" options={[{value:'Asia/Jakarta',label:'WIB (UTC+7)'},{value:'Asia/Makassar',label:'WITA (UTC+8)'},{value:'Asia/Jayapura',label:'WIT (UTC+9)'}]} />
          </div>
          <div className="mt-6"><Button>Simpan Perubahan</Button></div>
        </Card>
        <Card>
          <h3 className="text-base font-semibold text-slate-900 mb-4">Election Settings</h3>
          <div className="space-y-5">
            <Toggle checked={notif} onChange={setNotif} label="Kirim notifikasi email saat election dimulai" />
            <Toggle checked={autoClose} onChange={setAutoClose} label="Auto-close election saat waktu berakhir" />
            <Toggle checked={maintenance} onChange={setMaintenance} label="Maintenance mode" />
            <Input label="Max Kandidat per Election" type="number" defaultValue="10" />
            <Input label="Min Voter Threshold (%)" type="number" defaultValue="50" />
          </div>
          <div className="mt-6"><Button>Simpan Perubahan</Button></div>
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Appearance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
              <div className="flex gap-2">
                {['#4f46e5','#2563eb','#7c3aed','#0891b2','#059669','#d97706'].map(c => (
                  <button key={c} className="w-8 h-8 rounded-lg border-2 border-white shadow-sm ring-1 ring-slate-200 hover:ring-indigo-400 transition-all" style={{backgroundColor:c}} />
                ))}
              </div>
            </div>
            <Input label="Logo URL" placeholder="https://..." />
            <Input label="Favicon URL" placeholder="https://..." />
          </div>
          <div className="mt-6"><Button>Simpan Perubahan</Button></div>
        </Card>
      </div>
    </div>
  );
}
