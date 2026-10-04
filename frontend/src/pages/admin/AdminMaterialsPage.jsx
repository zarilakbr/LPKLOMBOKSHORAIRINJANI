import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Modal from '../../components/admin/Modal';
import FormField from '../../components/admin/FormField';
import { materialService, classService } from '../../services/dataService';
import {
  BookOpen,
  Download,
  ExternalLink,
  Trash2,
  Eye,
  Edit2,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FileText,
  Paperclip,
  Globe
} from 'lucide-react';

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view' | null
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    class_id: '',
    title: '',
    description: '',
    type: 'file',
    external_url: '',
    is_published: true,
  });
  const [fileObject, setFileObject] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const [matRes, clsRes] = await Promise.allSettled([
        materialService.getAll(),
        classService.getAll()
      ]);

      if (matRes.status === 'fulfilled') {
        setMaterials(Array.isArray(matRes.value) ? matRes.value : []);
      }
      if (clsRes.status === 'fulfilled') {
        setClasses(Array.isArray(clsRes.value) ? clsRes.value : []);
      }
    } catch (err) {
      console.warn('Failed to load admin materials:', err);
      setFeedback({ type: 'error', message: 'Gagal terhubung ke layanan materi pembelajaran.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = (materials || []).filter((m) => {
    const title = String(m?.title ?? '').toLowerCase();
    const className = String(m?.className ?? '').toLowerCase();
    const teacherName = String(m?.teacherName ?? '').toLowerCase();
    const searchTerm = String(search ?? '').toLowerCase();

    const matchSearch =
      title.includes(searchTerm) ||
      className.includes(searchTerm) ||
      teacherName.includes(searchTerm);
    const matchClass = filterClass === 'ALL' || String(m?.classId ?? '') === String(filterClass);
    const matchStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'PUBLISHED' ? Boolean(m?.isPublished) : !m?.isPublished);

    return matchSearch && matchClass && matchStatus;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      class_id: classes.length > 0 ? String(classes[0].id) : '',
      title: '',
      description: '',
      type: 'file',
      external_url: '',
      is_published: true
    });
    setFileObject(null);
    setSelectedMaterial(null);
    setModalMode('create');
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setSelectedMaterial(item);
    setFormData({
      class_id: String(item.classId || ''),
      title: item.title || '',
      description: item.description || '',
      type: item.type || 'file',
      external_url: item.externalUrl || '',
      is_published: Boolean(item.isPublished)
    });
    setFileObject(null);
    setModalMode('edit');
  };

  // Save Create / Edit
  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);

    try {
      const dataPayload = new FormData();
      dataPayload.append('class_id', formData.class_id);
      dataPayload.append('title', formData.title);
      dataPayload.append('description', formData.description || '');
      dataPayload.append('type', formData.type);
      dataPayload.append('is_published', formData.is_published ? '1' : '0');

      if (formData.type === 'link') {
        dataPayload.append('external_url', formData.external_url || '');
      } else if (formData.type === 'file' && fileObject) {
        dataPayload.append('file', fileObject);
      }

      if (modalMode === 'create') {
        if (formData.type === 'file' && !fileObject) {
          setFeedback({ type: 'error', message: 'Silakan pilih berkas materi yang akan diunggah.' });
          setActionLoading(false);
          return;
        }
        await materialService.create(dataPayload);
        setFeedback({ type: 'success', message: 'Materi pembelajaran baru berhasil diunggah.' });
      } else if (modalMode === 'edit' && selectedMaterial) {
        await materialService.update(selectedMaterial.id, dataPayload);
        setFeedback({ type: 'success', message: 'Materi pembelajaran berhasil diperbarui.' });
      }

      setModalMode(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menyimpan materi pembelajaran.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await materialService.delete(deleteTarget.id);
      setFeedback({ type: 'success', message: 'Materi pembelajaran berhasil dihapus.' });
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menghapus materi.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // Download
  const handleDownload = async (material) => {
    try {
      const res = await materialService.download(material.id);
      const blob = new Blob([res], { type: material.mimeType || 'application/octet-stream' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', material.originalFilename || `materi-${material.id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Gagal mengunduh berkas: ' + (err.response?.data?.message || err.message)
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            Materi Pembelajaran LMS (Curriculum Materials)
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Kelola dokumen modul, video/tautan pembelajaran, dan materi ajar untuk seluruh kelas binaan.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            disabled={classes.length === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--vermilion)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: classes.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <Plus size={16} />
            <span>Unggah Materi Baru</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            color: feedback.type === 'error' ? 'var(--vermilion)' : 'var(--emerald)',
            border: `1px solid ${feedback.type === 'error' ? 'var(--vermilion-border)' : 'rgba(16, 185, 129, 0.25)'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Cari judul, kelas, atau pengajar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: '1 1 240px',
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)'
          }}
        />

        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="ALL">Semua Kelas</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.className || c.name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="ALL">Semua Status</option>
          <option value="PUBLISHED">Diterbitkan (PUBLISHED)</option>
          <option value="DRAFT">Draf (DRAFT)</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={[
          {
            header: 'Judul Materi',
            render: (row) => (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.title}</div>
                {row.description && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.description}
                  </div>
                )}
              </div>
            )
          },
          {
            header: 'Kelas Belajar',
            render: (row) => <span style={{ fontWeight: 600 }}>{row.className || '-'}</span>
          },
          {
            header: 'Pengajar / Sensei',
            render: (row) => <span>{row.teacherName || 'Sensei'}</span>
          },
          {
            header: 'Tipe',
            render: (row) => (
              <span style={{ textTransform: 'capitalize', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                {row.type === 'file' ? <FileText size={13} /> : row.type === 'link' ? <Globe size={13} /> : <BookOpen size={13} />}
                {row.type}
              </span>
            )
          },
          {
            header: 'Status',
            render: (row) => (
              <StatusBadge
                status={row.isPublished ? 'ACTIVE' : 'DRAFT'}
                label={row.isPublished ? 'Diterbitkan' : 'Draf'}
              />
            )
          },
          {
            header: 'Aksi',
            render: (row) => (
              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                {row.type === 'file' && row.hasFile && (
                  <button
                    type="button"
                    onClick={() => handleDownload(row)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem', color: '#0284C7' }}
                    title="Unduh Berkas Materi"
                  >
                    <Download size={13} />
                  </button>
                )}

                {row.type === 'link' && row.externalUrl && (
                  <a
                    href={row.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem', color: '#7C3AED', display: 'inline-flex', alignItems: 'center' }}
                    title="Buka Tautan Luar"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedMaterial(row);
                    setModalMode('view');
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem' }}
                  title="Lihat Detail"
                >
                  <Eye size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(row)}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem' }}
                  title="Edit Materi"
                >
                  <Edit2 size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteTarget(row)}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem', color: 'var(--vermilion)', borderColor: 'var(--vermilion-border)' }}
                  title="Hapus Materi"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          }
        ]}
        data={filtered}
        totalItems={filtered.length}
        loading={loading}
        onAddNew={handleOpenCreate}
        addNewLabel="Unggah Materi Baru"
        onView={(row) => {
          setSelectedMaterial(row);
          setModalMode('view');
        }}
        onEdit={handleOpenEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      {/* MODAL 1: VIEW DETAIL */}
      <Modal
        isOpen={modalMode === 'view' && !!selectedMaterial}
        onClose={() => setModalMode(null)}
        title="Detail Materi Pembelajaran"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            {selectedMaterial?.type === 'file' && selectedMaterial?.hasFile && (
              <button
                type="button"
                onClick={() => handleDownload(selectedMaterial)}
                className="btn btn-primary btn-sm"
              >
                <Download size={14} /> Unduh Berkas ({selectedMaterial.fileSizeFormatted || 'File'})
              </button>
            )}
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Tutup
            </button>
          </div>
        }
      >
        {selectedMaterial && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Judul Materi</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedMaterial.title}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kelas</div>
                <div style={{ fontWeight: 600 }}>{selectedMaterial.className}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pengajar</div>
                <div>{selectedMaterial.teacherName || 'Sensei'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status Publikasi</div>
                <div>
                  <StatusBadge
                    status={selectedMaterial.isPublished ? 'ACTIVE' : 'DRAFT'}
                    label={selectedMaterial.isPublished ? 'Diterbitkan' : 'Draf'}
                  />
                </div>
              </div>
            </div>

            {selectedMaterial.description && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Deskripsi / Isi:</div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  {selectedMaterial.description}
                </div>
              </div>
            )}

            {selectedMaterial.type === 'file' && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                <div><strong>Nama Berkas:</strong> {selectedMaterial.originalFilename || '-'}</div>
                <div><strong>Ukuran:</strong> {selectedMaterial.fileSizeFormatted || '-'}</div>
                <div><strong>Tipe MIME:</strong> {selectedMaterial.mimeType || '-'}</div>
              </div>
            )}

            {selectedMaterial.type === 'link' && selectedMaterial.externalUrl && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Tautan Eksternal:</strong>{' '}
                <a href={selectedMaterial.externalUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--vermilion)', wordBreak: 'break-all' }}>
                  {selectedMaterial.externalUrl}
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* MODAL 2: CREATE / EDIT MATERIAL */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Unggah Materi Pembelajaran Baru' : 'Edit Materi Pembelajaran'}
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="material-form" disabled={actionLoading} className="btn btn-primary btn-sm">
              {actionLoading ? 'Menyimpan...' : 'Simpan Materi'}
            </button>
          </>
        }
      >
        <form id="material-form" onSubmit={handleSave}>
          <FormField
            label="Kelas Belajar *"
            type="select"
            required
            value={formData.class_id}
            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
            options={classes.map((c) => ({
              value: c.id,
              label: `${c.className || c.name}`
            }))}
          />

          <FormField
            label="Judul Materi Pembelajaran *"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Contoh: Modul Bunpo & Kotoba Bab 1 - 5 (PDF)"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Jenis Materi *"
              type="select"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'file', label: 'File Dokumen / Presentasi (PDF/Doc/Xls/Zip)' },
                { value: 'link', label: 'Tautan Eksternal / Video (URL)' },
                { value: 'text', label: 'Teks / Ringkasan Catatan' }
              ]}
            />

            <FormField
              label="Status Penerbitan"
              type="select"
              value={formData.is_published ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.value === 'true' })}
              options={[
                { value: 'true', label: 'Diterbitkan (Terlihat oleh Siswa)' },
                { value: 'false', label: 'Draf (Hanya Admin & Pengajar)' }
              ]}
            />
          </div>

          {formData.type === 'file' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Berkas Dokumen {modalMode === 'create' ? '*' : '(Biarkan kosong jika tidak diganti)'}
              </label>
              <input
                type="file"
                onChange={(e) => setFileObject(e.target.files[0] || null)}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.png,.jpg,.jpeg,.webp"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--bg-surface)'
                }}
              />
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Format didukung: PDF, Word, Excel, PPT, ZIP, Gambar (Maks. 20 MB). Disimpan di private storage terproteksi.
              </div>
            </div>
          )}

          {formData.type === 'link' && (
            <FormField
              label="Alamat URL Tautan Luar *"
              type="url"
              required
              value={formData.external_url}
              onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
              placeholder="https://drive.google.com/... atau https://youtube.com/..."
            />
          )}

          <FormField
            label="Deskripsi / Catatan Tambahan"
            type="textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ringkasan materi, petunjuk pengerjaan tugas, atau instruksi dari Sensei..."
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Materi Pembelajaran"
        message={`Apakah Anda yakin ingin menghapus materi "${deleteTarget?.title}"? Dokumen fisik akan dihapus dari server penyimpanan.`}
        confirmLabel="Hapus Permanen"
        cancelLabel="Batal"
        isDanger
      />
    </div>
  );
}
