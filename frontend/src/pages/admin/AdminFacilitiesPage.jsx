import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Plus, Copy, Trash2 } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import PhotoUrlField from '../../components/admin/PhotoUrlField';
import { facilityService } from '../../services/dataService';

const defaultFacilityRow = () => ({
  name: '',
  category: 'Ruang Kelas',
  description: '',
  image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
  order: 1,
  status: 'ACTIVE'
});

export default function AdminFacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [createRows, setCreateRows] = useState([defaultFacilityRow()]);
  const [formData, setFormData] = useState(defaultFacilityRow());

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
    setCreateRows([{
      ...defaultFacilityRow(),
      order: facilities.length + 1
    }]);
    setSelectedItem(null);
    setModalMode('create');
  };

  const handleAddRow = () => {
    setCreateRows((prev) => [
      ...prev,
      {
        ...defaultFacilityRow(),
        order: facilities.length + prev.length + 1
      }
    ]);
  };

  const handleDuplicateRow = (index) => {
    setCreateRows((prev) => {
      const source = prev[index];
      const clone = {
        ...source,
        name: source.name ? `${source.name} (Salinan)` : '',
        order: facilities.length + prev.length + 1
      };
      const next = [...prev];
      next.splice(index + 1, 0, clone);
      return next;
    });
  };

  const handleRemoveRow = (index) => {
    setCreateRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, value) => {
    setCreateRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
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
    setActionLoading(true);
    setFeedback(null);
    try {
      if (modalMode === 'create') {
        for (let i = 0; i < createRows.length; i++) {
          const row = createRows[i];
          if (!row.name?.trim() || !row.image?.trim() || !row.description?.trim()) {
            setFeedback({
              type: 'error',
              message: `Baris #${i + 1}: Nama fasilitas, URL foto, dan deskripsi wajib diisi.`
            });
            setActionLoading(false);
            return;
          }
        }
        await Promise.all(createRows.map((row) => facilityService.create(row)));
        setFeedback({
          type: 'success',
          message: `Berhasil menambahkan ${createRows.length} fasilitas lembaga baru.`
        });
      } else if (modalMode === 'edit' && selectedItem) {
        if (!formData.name?.trim() || !formData.image?.trim() || !formData.description?.trim()) {
          setFeedback({
            type: 'error',
            message: 'Nama fasilitas, URL foto, dan deskripsi wajib diisi.'
          });
          setActionLoading(false);
          return;
        }
        await facilityService.update(selectedItem.id, formData);
        setFeedback({ type: 'success', message: 'Data fasilitas berhasil diperbarui.' });
      }
      setModalMode(null);
      await loadData();
    } catch (err) {
      console.error('Failed to save facility:', err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal menyimpan fasilitas.';
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
      await facilityService.delete(deleteTarget.id);
      setFeedback({ type: 'success', message: 'Fasilitas berhasil dihapus.' });
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete facility:', err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal menghapus fasilitas.';
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Pratinjau',
      width: '100px',
      render: (row) => (
        <img
          src={row.image || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80'}
          alt={row.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80';
          }}
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
      {feedback && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: feedback.type === 'success' ? '#16A34A' : '#EF4444',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{feedback.message}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.25)'
          }}
        >
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
        title={modalMode === 'create' ? `Tambah Fasilitas Lembaga (${createRows.length} Data)` : 'Edit Fasilitas'}
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
              form="fac-form"
              className="btn btn-primary btn-sm"
              disabled={actionLoading}
            >
              {actionLoading
                ? 'Menyimpan...'
                : (modalMode === 'create' ? `Simpan Semua Fasilitas (${createRows.length} Data)` : 'Simpan Fasilitas')}
            </button>
          </>
        }
      >
        <form id="fac-form" onSubmit={handleSave}>
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
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid #E2E8F0'
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>
                      Fasilitas #{index + 1}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleDuplicateRow(index)}
                        className="btn btn-outline btn-xs"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem'
                        }}
                        title="Duplikat baris data ini"
                      >
                        <Copy size={13} /> Duplikat
                      </button>
                      {createRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="btn btn-outline btn-xs"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            color: '#EF4444',
                            borderColor: '#FECACA'
                          }}
                          title="Hapus baris data ini"
                        >
                          <Trash2 size={13} /> Hapus
                        </button>
                      )}
                    </div>
                  </div>

                  <FormField
                    label="Nama Fasilitas"
                    required
                    value={row.name}
                    onChange={(e) => handleRowChange(index, 'name', e.target.value)}
                    placeholder="Contoh: Ruang Kelas Ber-AC (Dojo Belajar)"
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <FormField
                      label="Kategori"
                      value={row.category}
                      onChange={(e) => handleRowChange(index, 'category', e.target.value)}
                    />
                    <FormField
                      label="Nomor Urutan"
                      type="number"
                      value={row.order}
                      onChange={(e) => handleRowChange(index, 'order', Number(e.target.value))}
                    />
                  </div>

                  <PhotoUrlField
                    label="URL Foto Sarana"
                    required
                    value={row.image}
                    onChange={(val) => handleRowChange(index, 'image', val)}
                    placeholder="https://..."
                  />

                  <FormField
                    label="Deskripsi Spesifikasi Sarana"
                    type="textarea"
                    rows={2}
                    required
                    value={row.description}
                    onChange={(e) => handleRowChange(index, 'description', e.target.value)}
                  />

                  <FormField
                    label="Status Sarana"
                    type="select"
                    value={row.status}
                    onChange={(e) => handleRowChange(index, 'status', e.target.value)}
                    options={[
                      { value: 'ACTIVE', label: 'Aktif' },
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
                <Plus size={16} /> Tambah Baris Fasilitas Lainnya
              </button>
            </div>
          ) : (
            <div>
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

              <PhotoUrlField
                label="URL Foto Sarana"
                required
                value={formData.image}
                onChange={(val) => setFormData({ ...formData, image: val })}
                placeholder="https://..."
              />

              <FormField
                label="Deskripsi Spesifikasi Sarana"
                type="textarea"
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <FormField
                label="Status Sarana"
                type="select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'ACTIVE', label: 'Aktif' },
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
        title="Hapus Fasilitas"
        message={`Apakah Anda yakin ingin menghapus '${deleteTarget?.name}'?`}
      />
    </div>
  );
}
