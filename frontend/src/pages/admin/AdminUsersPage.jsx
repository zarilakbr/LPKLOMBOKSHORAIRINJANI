import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import { userService } from '../../services/dataService';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STAFF',
    department: '',
    status: 'ACTIVE'
  });

  const loadData = () => {
    userService.getAll().then((data) => setUsers(data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'ALL' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      role: 'STAFF',
      department: 'Front Office & Konseling',
      status: 'ACTIVE'
    });
    setSelectedItem(null);
    setModalMode('create');
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      email: item.email,
      role: item.role,
      department: item.department,
      status: item.status
    });
    setModalMode('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      await userService.create(formData);
    } else if (modalMode === 'edit' && selectedItem) {
      await userService.update(selectedItem.id, formData);
    }
    setModalMode(null);
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await userService.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  };

  const columns = [
    {
      header: 'Nama & Email Pengguna',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{row.name}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{row.email}</div>
        </div>
      )
    },
    {
      header: 'Peran Akses (Role)',
      render: (row) => <StatusBadge status={row.role} />
    },
    { header: 'Divisi / Unit Kerja', accessor: 'department' },
    { header: 'Login Terakhir', accessor: 'lastLogin' },
    {
      header: 'Status Akun',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={filtered}
        totalItems={filtered.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari pengguna berdasarkan nama/email..."
        filterValue={filterRole}
        onFilterChange={setFilterRole}
        filterOptions={[
          { value: 'ALL', label: 'Semua Role' },
          { value: 'SUPER_ADMIN', label: 'SUPER_ADMIN' },
          { value: 'ADMIN', label: 'ADMIN' },
          { value: 'STAFF', label: 'STAFF' }
        ]}
        onAddNew={handleOpenCreate}
        addNewLabel="Tambah Pengguna Baru"
        onView={(row) => {
          setSelectedItem(row);
          setModalMode('view');
        }}
        onEdit={handleOpenEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      {/* Modal */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Tambah Pengguna Admin' : 'Edit Pengguna'}
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="user-form" className="btn btn-primary btn-sm">
              Simpan Pengguna
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSave}>
          <FormField
            label="Nama Lengkap"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Rina Puspita"
          />

          <FormField
            label="Alamat Email Login"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="admin@lombokshorairinjani.co.id"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Peran Akses (RBAC Role)"
              type="select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'SUPER_ADMIN', label: 'SUPER_ADMIN (Akses Penuh Sistem)' },
                { value: 'ADMIN', label: 'ADMIN (Konten & Pendaftaran)' },
                { value: 'STAFF', label: 'STAFF (Pendaftaran Terbatas)' }
              ]}
            />

            <FormField
              label="Status Akun"
              type="select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'Aktif (Dapat Login)' },
                { value: 'INACTIVE', label: 'Non-aktif (Ditangguhkan)' }
              ]}
            />
          </div>

          <FormField
            label="Divisi / Departemen"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            placeholder="Contoh: Divisi Kurikulum & Akademik"
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Akun Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun '${deleteTarget?.name}'?`}
      />
    </div>
  );
}
