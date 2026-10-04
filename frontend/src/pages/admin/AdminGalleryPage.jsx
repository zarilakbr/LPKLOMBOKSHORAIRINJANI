import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Classroom',
    description: '',
    image: '',
    order: 1,
    status: 'ACTIVE'
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await galleryService.getAll();
      setGallery(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load gallery:', err);
      setError('Gagal memuat data galeri.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = (gallery || []).filter((g) => {
    const title = String(g?.title ?? '').toLowerCase();
    const description = String(g?.description ?? '').toLowerCase();
    const searchTerm = String(search ?? '').toLowerCase();

    const matchSearch = title.includes(searchTerm) || description.includes(searchTerm);
    const matchCat = filterCat === 'ALL' || g?.category === filterCat;
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
    if (!formData.title?.trim() || !formData.image?.trim()) {
      setFeedback({ type: 'error', message: 'Judul dan URL gambar galeri wajib diisi.' });
      return;
    }
    setActionLoading(true);
    setFeedback(null);
    try {
      if (modalMode === 'create') {
        await galleryService.create(formData);
        setFeedback({ type: 'success', message: 'Foto dokumentasi berhasil ditambahkan ke galeri.' });
      } else if (modalMode === 'edit' && selectedItem) {
        await galleryService.update(selectedItem.id, formData);
        setFeedback({ type: 'success', message: 'Data foto galeri berhasil diperbarui.' });
      }
      setModalMode(null);
      await loadData();
    } catch (err) {
      console.error('Failed to save gallery:', err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal menyimpan foto galeri.';
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await galleryService.delete(deleteTarget.id);
      setFeedback({ type: 'success', message: 'Foto galeri berhasil dihapus.' });
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete gallery item:', err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal menghapus foto galeri.';
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setActionLoading(false);
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
      {feedback && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: feedback.type === 'success' ? '#16A34A' : '#EF4444',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{feedback.message}</span>
        </div>
      )}

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
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="btn btn-outline btn-sm"
              disabled={actionLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              form="gallery-form"
              className="btn btn-primary btn-sm"
              disabled={actionLoading}
            >
              {actionLoading ? 'Menyimpan...' : 'Simpan Foto'}
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
