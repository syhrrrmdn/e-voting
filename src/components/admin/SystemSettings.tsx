'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Button, Input, Select, Toggle, Badge } from '@/components/ui';

export default function SystemSettings() {
  const [settings, setSettings] = useState<any>({
    appName: 'MudaVote',
    tagline: 'Platform E-Voting Organisasi Modern',
    defaultLanguage: 'id',
    timezone: 'Asia/Jakarta',
    emailNotification: true,
    autoClose: true,
    maintenanceMode: false,
    maxCandidates: 10,
    minVoterThreshold: 50,
    primaryColor: '#4f46e5',
    logoUrl: '',
    faviconUrl: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Database Connection states
  const [dbStatus, setDbStatus] = useState<{
    loading: boolean;
    success: boolean;
    status: string;
    message: string;
    dbName: string;
    error?: string;
  }>({
    loading: true,
    success: false,
    status: 'Checking...',
    message: '',
    dbName: ''
  });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const json = await res.json();
      if (json.success && json.data) {
        setSettings(json.data);
      }
    } catch (err) {
      console.error('Gagal mengambil settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkDatabase = async () => {
    setDbStatus(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/db-check');
      const data = await res.json();
      if (data.success) {
        setDbStatus({
          loading: false,
          success: true,
          status: data.status,
          message: data.message,
          dbName: data.dbName
        });
      } else {
        setDbStatus({
          loading: false,
          success: false,
          status: 'Disconnected',
          message: data.message || 'Gagal terhubung ke database',
          dbName: '',
          error: data.error
        });
      }
    } catch (err: any) {
      setDbStatus({
        loading: false,
        success: false,
        status: 'Error',
        message: 'Gagal memanggil API cek database',
        dbName: '',
        error: err.message
      });
    }
  };

  useEffect(() => {
    fetchSettings();
    checkDatabase();
  }, []);

  const handleUpdateField = (key: string, val: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: val
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const json = await res.json();
      if (json.success) {
        showNotification('Pengaturan sistem berhasil disimpan.');
        setSettings(json.data);
      } else {
        alert(json.message || 'Gagal menyimpan pengaturan');
      }
    } catch (err) {
      alert('Gagal menghubungkan ke server');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin mb-3" />
        <p className="text-sm font-medium">Memuat pengaturan sistem...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      <PageHeader title="Pengaturan Sistem" subtitle="Konfigurasi global sistem e-voting" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Connection Diagnostics Card */}
        <Card className="lg:col-span-2 border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Status Koneksi Database</h3>
              <p className="text-xs text-slate-500">Hasil diagnosis konektivitas ke database MongoDB cluster</p>
            </div>
            <Button variant="secondary" size="sm" onClick={checkDatabase} disabled={dbStatus.loading}>
              {dbStatus.loading ? 'Menghubungkan...' : 'Uji Koneksi Ulang'}
            </Button>
          </div>

          {dbStatus.loading ? (
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl animate-pulse">
              <div className="w-3.5 h-3.5 bg-slate-300 rounded-full"></div>
              <span className="text-sm font-semibold text-slate-500">Memeriksa status koneksi ke MongoDB cluster...</span>
            </div>
          ) : dbStatus.success ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold">Koneksi MongoDB Berhasil!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{dbStatus.message}</p>
                </div>
                <Badge color="green">{dbStatus.status}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase">Nama Database</span>
                  <span className="text-sm font-bold text-slate-700">{dbStatus.dbName || 'e_voting'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase">Provider Database</span>
                  <span className="text-sm font-bold text-slate-700">MongoDB Atlas</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="block text-[11px] font-semibold text-slate-400 uppercase">Driver</span>
                  <span className="text-sm font-bold text-slate-700">Mongoose / Node.js Native</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-800">
                <span className="relative flex h-3 w-3">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold">Koneksi MongoDB Gagal</p>
                  <p className="text-xs text-red-600 mt-0.5">{dbStatus.message}</p>
                </div>
                <Badge color="red">{dbStatus.status}</Badge>
              </div>

              {dbStatus.error && (
                <div className="p-3 bg-red-950 text-red-300 rounded-lg font-mono text-xs overflow-x-auto">
                  <strong>Detail Kesalahan:</strong> {dbStatus.error}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* General Settings */}
        <Card>
          <h3 className="text-base font-semibold text-slate-900 mb-4">Umum</h3>
          <div className="space-y-4">
            <Input 
              label="Nama Platform" 
              value={settings.appName} 
              onChange={e => handleUpdateField('appName', e.target.value)} 
            />
            <Input 
              label="Tagline" 
              value={settings.tagline} 
              onChange={e => handleUpdateField('tagline', e.target.value)} 
            />
            <Select 
              label="Bahasa Default" 
              value={settings.defaultLanguage}
              onChange={e => handleUpdateField('defaultLanguage', e.target.value)}
              options={[{value:'id',label:'Bahasa Indonesia'},{value:'en',label:'English'}]} 
            />
            <Select 
              label="Timezone" 
              value={settings.timezone}
              onChange={e => handleUpdateField('timezone', e.target.value)}
              options={[{value:'Asia/Jakarta',label:'WIB (UTC+7)'},{value:'Asia/Makassar',label:'WITA (UTC+8)'},{value:'Asia/Jayapura',label:'WIT (UTC+9)'}]} 
            />
          </div>
          <div className="mt-6">
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </Card>

        {/* Election Policy Settings */}
        <Card>
          <h3 className="text-base font-semibold text-slate-900 mb-4">Pengaturan Pemilihan</h3>
          <div className="space-y-5">
            <Toggle 
              checked={settings.emailNotification} 
              onChange={val => handleUpdateField('emailNotification', val)} 
              label="Kirim notifikasi email saat election dimulai" 
            />
            <Toggle 
              checked={settings.autoClose} 
              onChange={val => handleUpdateField('autoClose', val)} 
              label="Auto-close election saat waktu berakhir" 
            />
            <Toggle 
              checked={settings.maintenanceMode} 
              onChange={val => handleUpdateField('maintenanceMode', val)} 
              label="Maintenance mode" 
            />
            <Input 
              label="Max Kandidat per Election" 
              type="number" 
              value={settings.maxCandidates} 
              onChange={e => handleUpdateField('maxCandidates', Number(e.target.value))} 
            />
            <Input 
              label="Min Voter Threshold (%)" 
              type="number" 
              value={settings.minVoterThreshold} 
              onChange={e => handleUpdateField('minVoterThreshold', Number(e.target.value))} 
            />
          </div>
          <div className="mt-6">
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </Card>

        {/* Appearance Settings */}
        <Card className="lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Tampilan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Warna Utama</label>
              <div className="flex gap-2">
                {['#4f46e5','#2563eb','#7c3aed','#0891b2','#059669','#d97706'].map(c => (
                  <button 
                    key={c} 
                    onClick={() => handleUpdateField('primaryColor', c)}
                    className={`w-8 h-8 rounded-lg border-2 shadow-sm transition-all ${settings.primaryColor === c ? 'border-indigo-600 scale-110 ring-2 ring-indigo-400' : 'border-white hover:scale-105'}`} 
                    style={{backgroundColor:c}} 
                  />
                ))}
              </div>
            </div>
            <Input 
              label="Logo URL" 
              placeholder="https://..." 
              value={settings.logoUrl || ''} 
              onChange={e => handleUpdateField('logoUrl', e.target.value)} 
            />
            <Input 
              label="Favicon URL" 
              placeholder="https://..." 
              value={settings.faviconUrl || ''} 
              onChange={e => handleUpdateField('faviconUrl', e.target.value)} 
            />
          </div>
          <div className="mt-6">
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
