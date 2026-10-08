import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Plus, Copy, Trash2 } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import PhotoUrlField from '../../components/admin/PhotoUrlField';
import { galleryService } from '../../services/dataService';

const defaultGalleryRow = () => ({
  title: '',
  category: 'Classroom',
  description: '',
  image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
  order: 1,
  status: 'ACTIVE'
});

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

  const [createRows, setCreateRows] = useState([defaultGalleryRow()]);
  const [formData, setFormData] = useState(defaultGalleryRow());

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
    setCreateRows([{
      ...defaultGalleryRow(),
      order: gallery.length + 1
    }]);
    setSelectedItem(null);
    setModalMode('create');
  };

  const handleAddRow = () => {
    setCreateRows(prev => [
      ...prev,
      {
        ...defaultGalleryRow(),
        order: gallery.length + prev.length + 1
      }
    ]);
  };

  const handleDuplicateRow = (index) => {
    setCreateRows(prev => {
      const source = prev[index];
      const clone = {
        ...source,
        title: source.title ? `${source.title} (Salinan)` : '',
        order: gallery.length + prev.length + 1
      };
      const next = [...prev];
      next.splice(index + 1, 0, clone);
      return next;
    });
  };

  const handleRemoveRow = (index) => {
    setCreateRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, value) => {
    setCreateRows(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
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
    setActionLoading(true);
    setFeedback(null);
    try {
      if (modalMode === 'create') {
        // Validasi seluruh baris
        for (let i = 0; i < createRows.length; i++) {
          const row = createRows[i];
          if (!row.title?.trim() || !row.image?.trim()) {
            setFeedback({
              type: 'error',
              message: `Baris #${i + 1}: Judul foto dan URL gambar wajib diisi.`
            });
            setActionLoading(false);
            return;
          }
        }
        await Promise.all(createRows.map(row => galleryService.create(row)));
        setFeedback({
          type: 'success',
          message: `Berhasil menambahkan ${createRows.length} foto ke galeri.`
        });
      } else if (modalMode === 'edit' && selectedItem) {
        if (!formData.title?.trim() || !formData.image?.trim()) {
          setFeedback({ type: 'error', message: 'Judul dan URL gambar galeri wajib diisi.' });
          setActionLoading(false);
          return;
        }
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
          src={row.image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'}
          alt={row.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80';
          }}
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
        title={modalMode === 'create' ? `Tambah Foto Galeri (${createRows.length} Data)` : 'Edit Dokumentasi Foto'}
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
              {actionLoading
                ? 'Menyimpan...'
                : (modalMode === 'create' ? `Simpan Semua Foto (${createRows.length} Data)` : 'Simpan Foto')}
            </button>
          </>
        }
      >
        <form id="gallery-form" onSubmit={handleSave}>
          {modalMode === 'create' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {createRows.map((row, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '1rem',
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>
                      Foto #{index + 1}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleDuplicateRow(index)}
                        className="btn btn-outline btn-xs"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        title="Duplikat baris data ini"
                      >
                        <Copy size={13} /> Duplikat
                      </button>
                      {createRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="btn btn-outline btn-xs"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: '#EF4444', borderColor: '#FECACA' }}
                          title="Hapus baris data ini"
                        >
                          <Trash2 size={13} /> Hapus
                        </button>
                      )}
                    </div>
                  </div>

                  <FormField
                    label="Judul Foto"
                    required
                    value={row.title}
                    onChange={(e) => handleRowChange(index, 'title', e.target.value)}
                    placeholder="Judul momen kegiatan..."
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <FormField
                      label="Kategori"
                      type="select"
                      value={row.category}
                      onChange={(e) => handleRowChange(index, 'category', e.target.value)}
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
                      value={row.order}
                      onChange={(e) => handleRowChange(index, 'order', Number(e.target.value))}
                    />
                  </div>

                  <PhotoUrlField
                    label="URL Foto / Gambar"
                    required
                    value={row.image}
                    onChange={(val) => handleRowChange(index, 'image', val)}
                    placeholder="https://..."
                  />

                  <FormField
                    label="Deskripsi Keterangan Foto"
                    type="textarea"
                    rows={2}
                    value={row.description}
                    onChange={(e) => handleRowChange(index, 'description', e.target.value)}
                  />

                  <FormField
                    label="Status Foto"
                    type="select"
                    value={row.status}
                    onChange={(e) => handleRowChange(index, 'status', e.target.value)}
                    options={[
                      { value: 'ACTIVE', label: 'Aktif (Tampil di Galeri)' },
                      { value: 'INACTIVE', label: 'Non-aktif' }
                    ]}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddRow}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px dashed #CBD5E1',
                  backgroundColor: '#F8FAFC',
                  color: '#2563EB',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Tambah Baris Foto Lainnya
              </button>
            </div>
          ) : (
            <div>
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

              <PhotoUrlField
                label="URL Foto / Gambar"
                required
                value={formData.image}
                onChange={(val) => setFormData({ ...formData, image: val })}
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
            </div>
          )}
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
