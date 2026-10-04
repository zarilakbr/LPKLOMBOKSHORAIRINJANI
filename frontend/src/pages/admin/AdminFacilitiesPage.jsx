import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import { facilityService } from '../../services/dataService';

export default function AdminFacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Ruang Kelas',
    description: '',
    image: '',
    order: 1,
    status: 'ACTIVE'
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await facilityService.getAll();
      setFacilities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load facilities:', err);
      setError('Gagal memuat data sarana & fasilitas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = (facilities || []).filter((f) => {
    const name = String(f?.name ?? '').toLowerCase();
    const description = String(f?.description ?? '').toLowerCase();
    const searchTerm = String(search ?? '').toLowerCase();

    return name.includes(searchTerm) || description.includes(searchTerm);
  });

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      category: 'Ruang Kelas',
      description: '',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
      order: facilities.length + 1,
      status: 'ACTIVE'
    });
    setSelectedItem(null);
    setModalMode('create');
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description,
      image: item.image,
      order: item.order || 1,
      status: item.status || 'ACTIVE'
    });
    setModalMode('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      await facilityService.create(formData);
    } else if (modalMode === 'edit' && selectedItem) {
      await facilityService.update(selectedItem.id, formData);
    }
    setModalMode(null);
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await facilityService.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  };

  const columns = [
    {
      header: 'Pratinjau',
      width: '100px',
      render: (row) => (
        <img
          src={row.image}
          alt={row.name}
          style={{ width: '60px', height: '42px', objectFit: 'cover', borderRadius: '4px' }}
        />
      )
    },
    {
      header: 'Nama Fasilitas',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{row.name}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{row.category}</div>
        </div>
      )
    },
    {
      header: 'Deskripsi Sarana',
      render: (row) => (
        <div style={{ fontSize: '0.85rem', color: '#475569', maxWidth: '380px' }}>
          {row.description}
        </div>
      )
    },
    { header: 'Urutan', accessor: 'order' },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status || 'ACTIVE'} />
    }
  ];

  return (
    <div>
      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#EF4444',
          border: '1px solid rgba(239, 68, 68, 0.25)'
        }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.875rem' }}>{error}</span>
        </div>
      )}
      <DataTable
        columns={columns}
        data={filtered}
        totalItems={filtered.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari fasilitas lembaga..."
        onAddNew={handleOpenCreate}
        addNewLabel="Tambah Fasilitas"
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
        title={modalMode === 'create' ? 'Tambah Fasilitas Lembaga' : 'Edit Fasilitas'}
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="fac-form" className="btn btn-primary btn-sm">
              Simpan Fasilitas
            </button>
          </>
        }
      >
        <form id="fac-form" onSubmit={handleSave}>
          <FormField
            label="Nama Fasilitas"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Ruang Kelas Ber-AC (Dojo Belajar)"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Kategori"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
            <FormField
              label="Nomor Urutan"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
            />
          </div>

          <FormField
            label="URL Foto Sarana"
            required
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          />

          <FormField
            label="Deskripsi Spesifikasi Sarana"
            type="textarea"
            rows={3}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Fasilitas"
        message={`Apakah Anda yakin ingin menghapus '${deleteTarget?.name}'?`}
      />
    </div>
  );
}
