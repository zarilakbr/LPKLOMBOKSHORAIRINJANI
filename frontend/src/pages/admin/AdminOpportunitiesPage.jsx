import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import PhotoUrlField from '../../components/admin/PhotoUrlField';
import { opportunityService } from '../../services/dataService';

export default function AdminOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [search, setSearch] = useState('');
  const [filterSector, setFilterSector] = useState('ALL');
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    sector: 'Caregiving / Perawat Lansia',
    location: 'Tokyo, Kanagawa, & Chiba',
    salaryRange: '¥190.000 - ¥245.000 / Bulan',
    languageReq: 'JLPT N4 atau JFT-Basic A2',
    ageReq: '19 - 35 Tahun',
    description: 'Peluang karier dan penempatan kerja di Jepang dengan fasilitas tempat tinggal, asuransi, dan pelatihan bahasa intensif.',
    image: '',
    status: 'OPEN'
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await opportunityService.getAll();
      setOpportunities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
      setError('Gagal memuat data peluang kerja.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = (opportunities || []).filter((o) => {
    const title = String(o?.title ?? '').toLowerCase();
    const location = String(o?.location ?? '').toLowerCase();
    const searchTerm = String(search ?? '').toLowerCase();

    const matchSearch = title.includes(searchTerm) || location.includes(searchTerm);
    const matchSector = filterSector === 'ALL' || o?.sector === filterSector;
    return matchSearch && matchSector;
  });

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      sector: 'Caregiving / Perawat Lansia',
      location: 'Tokyo & Kanagawa',
      salaryRange: '¥190.000 - ¥240.000 / Bulan',
      languageReq: 'JLPT N4 / JFT-Basic A2',
      ageReq: '19 - 35 Tahun',
      description: 'Peluang kerja di Jepang untuk posisi terkait. Fasilitas lengkap asuransi, akomodasi, dan bimbingan dokumen berkala.',
      image: '',
      status: 'OPEN'
    });
    setSelectedItem(null);
    setModalMode('create');
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      sector: item.sector,
      location: item.location,
      salaryRange: item.salaryRange,
      languageReq: item.languageReq,
      ageReq: item.ageReq,
      description: item.description,
      image: item.image || '',
      status: item.status
    });
    setModalMode('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.description?.trim()) {
      setFeedback({ type: 'error', message: 'Deskripsi lowongan kerja wajib diisi.' });
      return;
    }
    setActionLoading(true);
    setFeedback(null);
    try {
      if (modalMode === 'create') {
        await opportunityService.create(formData);
        setFeedback({ type: 'success', message: 'Peluang kerja baru berhasil ditambahkan.' });
      } else if (modalMode === 'edit' && selectedItem) {
        await opportunityService.update(selectedItem.id, formData);
        setFeedback({ type: 'success', message: 'Data peluang kerja berhasil diperbarui.' });
      }
      setModalMode(null);
      await loadData();
    } catch (err) {
      console.error('Failed to save opportunity:', err);
      let errMsg = 'Gagal menyimpan peluang kerja.';
      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat().join(' ');
        if (validationErrors) errMsg = validationErrors;
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
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
      await opportunityService.delete(deleteTarget.id);
      setFeedback({ type: 'success', message: 'Peluang kerja berhasil dihapus.' });
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete opportunity:', err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal menghapus peluang kerja.';
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Judul Peluang Kerja',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{row.title}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{row.sector}</div>
        </div>
      )
    },
    { header: 'Lokasi Penempatan', accessor: 'location' },
    { header: 'Estimasi Gaji', accessor: 'salaryRange' },
    { header: 'Syarat Bahasa', accessor: 'languageReq' },
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
        searchPlaceholder="Cari judul lowongan / lokasi..."
        filterValue={filterSector}
        onFilterChange={setFilterSector}
        filterOptions={[
          { value: 'ALL', label: 'Semua Sektor' },
          { value: 'Caregiving / Perawat Lansia', label: 'Caregiving (Kaigo)' },
          { value: 'Manufacturing / Permesinan', label: 'Manufaktur' },
          { value: 'Food Manufacturing & Catering', label: 'Pengolahan Makanan' },
          { value: 'Agriculture / Pertanian', label: 'Pertanian' },
          { value: 'Hospitality & Tourism', label: 'Perhotelan' }
        ]}
        onAddNew={handleOpenCreate}
        addNewLabel="Tambah Peluang Kerja"
        onView={(row) => {
          setSelectedItem(row);
          setModalMode('view');
        }}
        onEdit={handleOpenEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Tambah Peluang Kerja Jepang' : 'Edit Peluang Kerja'}
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
              form="opportunity-form"
              className="btn btn-primary btn-sm"
              disabled={actionLoading}
            >
              {actionLoading ? 'Menyimpan...' : 'Simpan Peluang Kerja'}
            </button>
          </>
        }
      >
        <form id="opportunity-form" onSubmit={handleSave}>
          <FormField
            label="Judul Peluang / Posisi"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Contoh: Caregiver & Perawat Lansia (Kaigo)"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Sektor Bidang"
              type="select"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              options={[
                { value: 'Caregiving / Perawat Lansia', label: 'Caregiving (Kaigo)' },
                { value: 'Manufacturing / Permesinan', label: 'Manufaktur' },
                { value: 'Food Manufacturing & Catering', label: 'Pengolahan Makanan' },
                { value: 'Agriculture / Pertanian', label: 'Pertanian' },
                { value: 'Hospitality & Tourism', label: 'Perhotelan' },
                { value: 'Construction / Konstruksi', label: 'Konstruksi' }
              ]}
            />
            <FormField
              label="Lokasi Prefektur Jepang"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Contoh: Tokyo, Kanagawa, & Chiba"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Estimasi Rentang Penghasilan"
              value={formData.salaryRange}
              onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
              placeholder="Contoh: ¥190.000 - ¥240.000 / Bulan"
            />
            <FormField
              label="Batasan Usia"
              value={formData.ageReq}
              onChange={(e) => setFormData({ ...formData, ageReq: e.target.value })}
              placeholder="Contoh: 19 - 35 Tahun"
            />
          </div>

          <FormField
            label="Kriteria Bahasa Jepang"
            required
            value={formData.languageReq}
            onChange={(e) => setFormData({ ...formData, languageReq: e.target.value })}
            placeholder="Contoh: JLPT N4 / JFT-Basic A2"
          />

          <FormField
            label="Deskripsi Posisi & Tanggung Jawab"
            type="textarea"
            rows={3}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Jelaskan gambaran pekerjaan, fasilitas akomodasi, dan persyaratan umum..."
          />

          <PhotoUrlField
            label="Link Foto Peluang Kerja (Opsional)"
            value={formData.image || ''}
            onChange={(val) => setFormData({ ...formData, image: val })}
            placeholder="https://images.unsplash.com/... atau URL foto lainnya"
            helpText="Gunakan tautan gambar langsung (URL valid berawalan http:// atau https://, maksimal 255 karakter)."
            previewHeight="120px"
          />

          <FormField
            label="Status Perekrutan"
            type="select"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'OPEN', label: 'OPEN (Perekrutan Aktif)' },
              { value: 'CLOSED', label: 'CLOSED (Perekrutan Ditutup)' },
              { value: 'DRAFT', label: 'DRAFT (Disimpan)' }
            ]}
          />
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={modalMode === 'view'}
        onClose={() => setModalMode(null)}
        title="Detail Peluang Kerja"
        footer={
          <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
            Tutup
          </button>
        }
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            {selectedItem.image && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '0.35rem' }}>FOTO REFERENSI</div>
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>POSISI & SEKTOR</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedItem.title} ({selectedItem.sector})</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>LOKASI & ESTIMASI GAJI</div>
              <div>{selectedItem.location} • {selectedItem.salaryRange}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>PERSYARATAN</div>
              <div>Bahasa: {selectedItem.languageReq} | Usia: {selectedItem.ageReq}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>DESKRIPSI</div>
              <p style={{ color: '#475569', lineHeight: 1.6, margin: '0.35rem 0 0 0' }}>{selectedItem.description}</p>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>STATUS</div>
              <div style={{ marginTop: '0.25rem' }}>
                <StatusBadge status={selectedItem.status} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Peluang Kerja"
        message={`Apakah Anda yakin ingin menghapus peluang kerja '${deleteTarget?.title}'?`}
      />
    </div>
  );
}
