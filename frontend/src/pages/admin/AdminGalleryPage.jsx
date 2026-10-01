import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import { galleryService } from '../../services/dataService';

export default function AdminGalleryPage() {
  const [gallery, setGallery] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Classroom',
    description: '',
    image: '',
    order: 1,
    status: 'ACTIVE'
  });

  const loadData = () => {
    galleryService.getAll().then((data) => setGallery(data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = gallery.filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'ALL' || g.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      category: 'Classroom',
      description: '',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
      order: gallery.length + 1,
      status: 'ACTIVE'
    });
    setSelectedItem(null);
    setModalMode('create');
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      description: item.description,
      image: item.image,
      order: item.order,
      status: item.status
    });
    setModalMode('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      await galleryService.create(formData);
    } else if (modalMode === 'edit' && selectedItem) {
      await galleryService.update(selectedItem.id, formData);
    }
    setModalMode(null);
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await galleryService.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  };

  const columns = [
    {
      header: 'Pratinjau Foto',
      width: '100px',
      render: (row) => (
        <img
          src={row.image}
          alt={row.title}
          style={{ width: '60px', height: '42px', objectFit: 'cover', borderRadius: '4px' }}
        />
      )
    },
    {
      header: 'Judul & Deskripsi Foto',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{row.title}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{row.description}</div>
        </div>
      )
    },
    { header: 'Kategori', accessor: 'category' },
    { header: 'Urutan', accessor: 'order' },
    {
      header: 'Status',
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
        searchPlaceholder="Cari judul foto..."
        filterValue={filterCat}
        onFilterChange={setFilterCat}
        filterOptions={[
          { value: 'ALL', label: 'Semua Kategori' },
          { value: 'Classroom', label: 'Classroom' },
          { value: 'Students', label: 'Students' },
          { value: 'Activities', label: 'Activities' },
          { value: 'Facilities', label: 'Facilities' },
          { value: 'Events', label: 'Events' },
          { value: 'Japan', label: 'Japan' }
        ]}
        onAddNew={handleOpenCreate}
        addNewLabel="Unggah Foto Baru"
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
        title={modalMode === 'create' ? 'Unggah Dokumentasi Foto' : 'Edit Dokumentasi Foto'}
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="gallery-form" className="btn btn-primary btn-sm">
              Simpan Foto
            </button>
          </>
        }
      >
        <form id="gallery-form" onSubmit={handleSave}>
          <FormField
            label="Judul Foto"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Judul momen kegiatan..."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Kategori"
              type="select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: 'Classroom', label: 'Classroom (Ruang Kelas)' },
                { value: 'Students', label: 'Students (Siswa)' },
                { value: 'Activities', label: 'Activities (Aktivitas Praktik)' },
                { value: 'Facilities', label: 'Facilities (Fasilitas)' },
                { value: 'Events', label: 'Events (Acara & Ujian)' },
                { value: 'Japan', label: 'Japan (Pelepasan/Jepang)' }
              ]}
            />
            <FormField
              label="Nomor Urutan Tampil"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
            />
          </div>

          <FormField
            label="URL Foto / Gambar"
            required
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://..."
          />

          <FormField
            label="Deskripsi Keterangan Foto"
            type="textarea"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <FormField
            label="Status Foto"
            type="select"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'ACTIVE', label: 'Aktif (Tampil di Galeri)' },
              { value: 'INACTIVE', label: 'Non-aktif' }
            ]}
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Foto Galeri"
        message={`Apakah Anda yakin ingin menghapus foto '${deleteTarget?.title}'?`}
      />
    </div>
  );
}
