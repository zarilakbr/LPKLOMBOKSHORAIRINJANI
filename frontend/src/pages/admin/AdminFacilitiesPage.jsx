import React, { useState, useEffect } from 'react';
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

  const [formData, setFormData] = useState({
    name: '',
    category: 'Ruang Kelas',
    description: '',
    image: '',
    order: 1,
    status: 'ACTIVE'
  });

  const loadData = () => {
    facilityService.getAll().then((data) => setFacilities(data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = facilities.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.description.toLowerCase().includes(search.toLowerCase())
  );

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
      <DataTable
        columns={columns}
        data={filtered}
        totalItems={filtered.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari fasilitas kampus..."
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
        title={modalMode === 'create' ? 'Tambah Fasilitas Kampus' : 'Edit Fasilitas'}
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
