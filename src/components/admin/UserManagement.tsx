'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Card, Table, Badge, Button, Modal, Input, Select, SearchInput, Avatar, Pagination, type TableColumn } from '@/components/ui';
import type { UserRole } from '@/types';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  
  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Form state
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'voter' as UserRole,
    status: 'active' as 'active' | 'inactive'
  });
  
  // Selected user for delete / reset password action
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchUsers = async (page: number = currentPage, pageLimit: number = limit) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', String(pageLimit));

      const res = await fetch(`/api/users?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setUsers(json.data);
        setTotalPages(json.pagination?.totalPages || 1);
        setTotalItems(json.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Gagal memuat pengguna:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchUsers(1, limit);
  }, [roleFilter]);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, limit);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'voter', status: 'active' });
    setFormModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setFormModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email) {
      alert('Nama dan Email harus diisi!');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        const res = await fetch(`/api/users/${editingUser._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          showNotification(`Pengguna ${formData.name} berhasil diperbarui.`);
          fetchUsers();
        } else {
          alert(json.message || 'Gagal memperbarui pengguna');
        }
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          showNotification(`Pengguna ${formData.name} berhasil ditambahkan.`);
          fetchUsers();
        } else {
          alert(json.message || 'Gagal menambahkan pengguna');
        }
      }
      setFormModalOpen(false);
    } catch (err) {
      alert('Gagal menghubungkan ke server');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (user: any) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/users/${selectedUser._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showNotification(`Pengguna ${selectedUser.name} berhasil dihapus.`);
        fetchUsers();
      } else {
        alert(json.message || 'Gagal menghapus pengguna');
      }
    } catch (err) {
      alert('Gagal menghubungkan ke server');
    }
    setDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const handleOpenReset = (user: any) => {
    setSelectedUser(user);
    setResetModalOpen(true);
  };

  const handleResetConfirm = () => {
    if (!selectedUser) return;
    showNotification(`Password untuk pengguna ${selectedUser.name} berhasil di-reset menjadi default.`);
    setResetModalOpen(false);
    setSelectedUser(null);
  };

  const columns: TableColumn<any>[] = [
    { 
      key: 'name', 
      label: 'Pengguna', 
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} src={r.avatar} size="sm" />
          <div>
            <p className="font-medium text-slate-900">{r.name}</p>
            <p className="text-xs text-slate-400">{r.email}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'role', 
      label: 'Peran', 
      render: (r) => (
        <Badge color={r.role === 'admin' ? 'indigo' : r.role === 'election_admin' ? 'green' : 'blue'}>
          {r.role === 'admin' ? 'Admin Sistem' : r.role === 'election_admin' ? 'Admin Pemilihan' : 'Pemilih'}
        </Badge>
      ) 
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (r) => (
        <Badge color={r.status === 'active' ? 'green' : 'red'} dot>
          {r.status === 'active' ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ) 
    },
    { 
      key: 'createdAt', 
      label: 'Bergabung', 
      className: 'hidden lg:table-cell', 
      render: (r) => (
        <span className="text-slate-500 text-sm">
          {new Date(r.createdAt).toLocaleDateString('id-ID')}
        </span>
      ) 
    },
    { 
      key: 'actions', 
      label: 'Aksi', 
      render: (r) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(r)}>Edit</Button>
          <Button variant="ghost" size="sm" className="text-amber-600 hover:bg-amber-50" onClick={() => handleOpenReset(r)}>
            Reset Password
          </Button>
          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleOpenDelete(r)}>
            Hapus
          </Button>
        </div>
      )
    },
  ];

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

      <PageHeader 
        title="Manajemen Pengguna" 
        subtitle={`${users.length} pengguna terdaftar di dalam sistem`} 
        action={
          <Button onClick={handleOpenAdd} icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          }>
            Tambah Pengguna
          </Button>
        } 
      />

      <Card padding={false}>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput 
              value={search} 
              onChange={setSearch} 
              placeholder="Cari nama atau email pengguna..." 
            />
          </div>
          <Select 
            options={[
              { value: 'all', label: 'Semua Peran' },
              { value: 'admin', label: 'Admin Sistem' },
              { value: 'election_admin', label: 'Admin Pemilihan' },
              { value: 'voter', label: 'Pemilih' }
            ]} 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)} 
          />
        </div>
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin mb-3" />
            <p className="text-sm font-medium">Memuat data pengguna...</p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={users} />
             <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                fetchUsers(page, limit);
              }}
              totalItems={totalItems}
              limit={limit}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setCurrentPage(1);
                fetchUsers(1, newLimit);
              }}
            />
          </>
        )}
      </Card>

      {/* Add / Edit Modal */}
      <Modal 
        open={formModalOpen} 
        onClose={() => setFormModalOpen(false)} 
        title={editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'} 
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormModalOpen(false)}>Batal</Button>
            <Button onClick={handleSaveUser} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Nama Lengkap" 
            placeholder="Masukkan nama lengkap" 
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input 
            label="Email" 
            type="email" 
            placeholder="email@domain.com" 
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            disabled={!!editingUser}
          />
          <Select 
            label="Peran" 
            options={[
              { value: 'voter', label: 'Pemilih' },
              { value: 'election_admin', label: 'Admin Pemilihan' },
              { value: 'admin', label: 'Admin Sistem' }
            ]} 
            value={formData.role}
            onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
          />
          <Select 
            label="Status Akun" 
            options={[
              { value: 'active', label: 'Aktif' },
              { value: 'inactive', label: 'Nonaktif' }
            ]} 
            value={formData.status}
            onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
          />
        </div>
      </Modal>

      {/* Reset Password Confirmation Modal */}
      {selectedUser && (
        <Modal 
          open={resetModalOpen} 
          onClose={() => setResetModalOpen(false)} 
          title="Konfirmasi Reset Password" 
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setResetModalOpen(false)}>Batal</Button>
              <Button variant="primary" onClick={handleResetConfirm}>Ya, Reset Password</Button>
            </>
          }
        >
          <div className="text-center py-2 space-y-3">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h4 className="font-bold text-slate-800 text-base">Reset Password Pengguna?</h4>
            <p className="text-sm text-slate-500">
              Apakah Anda yakin ingin me-reset password untuk pengguna <strong>{selectedUser.name}</strong>? Password akan dikembalikan ke setelan default sistem.
            </p>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {selectedUser && (
        <Modal 
          open={deleteModalOpen} 
          onClose={() => setDeleteModalOpen(false)} 
          title="Konfirmasi Hapus Pengguna" 
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Batal</Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>Hapus Pengguna</Button>
            </>
          }
        >
          <div className="text-center py-2 space-y-3">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h4 className="font-bold text-slate-800 text-base">Hapus Akun Pengguna?</h4>
            <p className="text-sm text-slate-500">
              Apakah Anda yakin ingin menghapus pengguna <strong>{selectedUser.name}</strong>? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
