import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Plus, Copy, Trash2 } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import PhotoUrlField from '../../components/admin/PhotoUrlField';
import { testimonialService } from '../../services/dataService';

const defaultTestimonialRow = () => ({
  name: '',
  program: 'Persiapan Kerja Tokutei Ginou (SSW)',
  placement: 'Tokyo, Jepang',
  year: '2026',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
  quote: '',
  badge: 'SSW Kaigo',
  status: 'ACTIVE'
});

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [createRows, setCreateRows] = useState([defaultTestimonialRow()]);
  const [formData, setFormData] = useState(defaultTestimonialRow());

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await testimonialService.getAll();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load testimonials:', err);
      setError('Gagal memuat data testimoni alumni.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = (testimonials || []).filter((t) => {
    const name = String(t?.name ?? '').toLowerCase();
    const placement = String(t?.placement ?? '').toLowerCase();
    const searchTerm = String(search ?? '').toLowerCase();

    return name.includes(searchTerm) || placement.includes(searchTerm);
  });

  const handleOpenCreate = () => {
    setCreateRows([defaultTestimonialRow()]);
    setSelectedItem(null);
    setModalMode('create');
  };

  const handleAddRow = () => {
    setCreateRows((prev) => [
      ...prev,
      defaultTestimonialRow()
    ]);
  };

  const handleDuplicateRow = (index) => {
    setCreateRows((prev) => {
      const source = prev[index];
      const clone = {
        ...source,
        name: source.name ? `${source.name} (Salinan)` : ''
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
      name: item.name || '',
      program: item.program || 'Persiapan Kerja Tokutei Ginou (SSW)',
      placement: item.placement || '',
      year: item.year || '2026',
      avatar: item.avatar || item.photo || '',
      quote: item.quote || item.content || '',
      badge: item.badge || 'SSW Kaigo',
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
          if (!row.name?.trim() || !row.quote?.trim()) {
            setFeedback({
              type: 'error',
              message: `Baris #${i + 1}: Nama alumni dan isi kutipan testimoni wajib diisi.`
            });
            setActionLoading(false);
            return;
          }
        }
        await Promise.all(createRows.map((row) => testimonialService.create(row)));
        setFeedback({
          type: 'success',
          message: `Berhasil menambahkan ${createRows.length} testimoni alumni baru.`
        });
      } else if (modalMode === 'edit' && selectedItem) {
        if (!formData.name?.trim() || !formData.quote?.trim()) {
          setFeedback({ type: 'error', message: 'Nama dan isi kutipan testimoni wajib diisi.' });
          setActionLoading(false);
          return;
        }
        await testimonialService.update(selectedItem.id, formData);
        setFeedback({ type: 'success', message: 'Data testimoni alumni berhasil diperbarui.' });
      }
      setModalMode(null);
      await loadData();
    } catch (err) {
      console.error('Failed to save testimonial:', err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal menyimpan testimoni.';
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
      await testimonialService.delete(deleteTarget.id);
      setFeedback({ type: 'success', message: 'Testimoni alumni berhasil dihapus.' });
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete testimonial:', err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal menghapus testimoni.';
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Nama Alumni',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={row.avatar || row.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt={row.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';
            }}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 700, color: '#0F172A' }}>{row.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{row.year}</div>
          </div>
        </div>
      )
    },
    { header: 'Program Diikuti', accessor: 'program' },
    { header: 'Penempatan di Jepang', accessor: 'placement' },
    {
      header: 'Kutipan',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic' }}>
          "{String(row?.quote || row?.content || '').slice(0, 70)}..."
        </span>
      )
    },
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
        searchPlaceholder="Cari nama alumni / penempatan..."
        onAddNew={handleOpenCreate}
        addNewLabel="Tambah Testimoni"
        onView={(row) => {
          setSelectedItem(row);
          setModalMode('view');
        }}
        onEdit={handleOpenEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      {/* Modal Form */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? `Tambah Cerita Alumni (${createRows.length} Data)` : 'Edit Testimoni'}
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
              form="testi-form"
              className="btn btn-primary btn-sm"
              disabled={actionLoading}
            >
              {actionLoading
                ? 'Menyimpan...'
                : (modalMode === 'create' ? `Simpan Semua Testimoni (${createRows.length} Data)` : 'Simpan Testimoni')}
            </button>
          </>
        }
      >
        <form id="testi-form" onSubmit={handleSave}>
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
                      Testimoni #{index + 1}
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
                    label="Nama Lengkap Alumni"
                    required
                    value={row.name}
                    onChange={(e) => handleRowChange(index, 'name', e.target.value)}
                    placeholder="Contoh: Bayu Pratama"
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <FormField
                      label="Program yang Diikuti"
                      required
                      value={row.program}
                      onChange={(e) => handleRowChange(index, 'program', e.target.value)}
                    />
                    <FormField
                      label="Tahun Lulus / Angkatan"
                      required
                      value={row.year}
                      onChange={(e) => handleRowChange(index, 'year', e.target.value.slice(0, 10))}
                      placeholder="Contoh: 2026"
                      maxLength={10}
                    />
                  </div>

                  <FormField
                    label="Kota & Bidang Penempatan di Jepang"
                    required
                    value={row.placement}
                    onChange={(e) => handleRowChange(index, 'placement', e.target.value)}
                    placeholder="Contoh: Caregiver di Yokohama, Kanagawa"
                  />

                  <PhotoUrlField
                    label="URL Foto Profil Alumni"
                    value={row.avatar}
                    onChange={(val) => handleRowChange(index, 'avatar', val)}
                    placeholder="https://..."
                    aspectRatio="1/1"
                    previewHeight="100px"
                    fallbackPlaceholder="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  />

                  <FormField
                    label="Isi Kutipan / Pengalaman"
                    type="textarea"
                    rows={2}
                    required
                    value={row.quote}
                    onChange={(e) => handleRowChange(index, 'quote', e.target.value)}
                    placeholder="Ceritakan pengalaman belajar di LPK dan bekerja di Jepang..."
                  />

                  <FormField
                    label="Status Publikasi"
                    type="select"
                    value={row.status}
                    onChange={(e) => handleRowChange(index, 'status', e.target.value)}
                    options={[
                      { value: 'ACTIVE', label: 'Aktif (Tampil di Beranda & Alumni)' },
                      { value: 'INACTIVE', label: 'Non-aktif (Disembunyikan)' }
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
                <Plus size={16} /> Tambah Baris Testimoni Lainnya
              </button>
            </div>
          ) : (
            <div>
              <FormField
                label="Nama Lengkap Alumni"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Bayu Pratama"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormField
                  label="Program yang Diikuti"
                  required
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                />
                <FormField
                  label="Tahun Lulus / Angkatan"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value.slice(0, 10) })}
                  placeholder="Contoh: 2026"
                  maxLength={10}
                />
              </div>

              <FormField
                label="Kota & Bidang Penempatan di Jepang"
                required
                value={formData.placement}
                onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                placeholder="Contoh: Caregiver di Yokohama, Kanagawa"
              />

              <PhotoUrlField
                label="URL Foto Profil Alumni"
                value={formData.avatar}
                onChange={(val) => setFormData({ ...formData, avatar: val })}
                placeholder="https://..."
                aspectRatio="1/1"
                previewHeight="100px"
                fallbackPlaceholder="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              />

              <FormField
                label="Isi Kutipan / Pengalaman"
                type="textarea"
                rows={3}
                required
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                placeholder="Ceritakan pengalaman belajar di LPK dan bekerja di Jepang..."
              />

              <FormField
                label="Status Publikasi"
                type="select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'ACTIVE', label: 'Aktif (Tampil di Beranda & Alumni)' },
                  { value: 'INACTIVE', label: 'Non-aktif (Disembunyikan)' }
                ]}
              />
            </div>
          )}
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={modalMode === 'view'}
        onClose={() => setModalMode(null)}
        title="Detail Testimoni Alumni"
        footer={
          <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
            Tutup
          </button>
        }
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                src={selectedItem.avatar || selectedItem.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={selectedItem.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';
                }}
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{selectedItem.name}</div>
                <div style={{ color: 'var(--vermilion)', fontWeight: 600 }}>{selectedItem.placement}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {selectedItem.program} • {selectedItem.year}
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#F8FAFC',
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                fontStyle: 'italic',
                lineHeight: 1.7,
                border: '1px solid #E2E8F0'
              }}
            >
              "{selectedItem.quote || selectedItem.content}"
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Testimoni Alumni"
        message={`Apakah Anda yakin ingin menghapus kutipan testimoni dari '${deleteTarget?.name}'?`}
      />
    </div>
  );
}
