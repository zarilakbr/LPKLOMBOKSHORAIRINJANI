import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  FileText,
  Link2,
  AlignLeft,
  Download,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  UploadCloud,
  File as FileIcon,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useRealtimeEvent, useRealtime } from '../../context/RealtimeContext';
import Button from '../../components/common/Button';

export default function TeacherMaterialsPage() {
  const [classes, setClasses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [viewingMaterial, setViewingMaterial] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    class_id: '',
    title: '',
    description: '',
    type: 'file',
    external_url: '',
    is_published: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const { onReconnect } = useRealtime();

  // Load teacher's assigned classes
  const loadTeacherClasses = useCallback(async () => {
    try {
      const res = await apiClient.get('/teacher/classes');
      if (res.data?.success) {
        const cls = res.data.data || [];
        setClasses(cls);
        if (cls.length > 0 && !formData.class_id) {
          setFormData((prev) => ({ ...prev, class_id: cls[0].id }));
        }
      }
    } catch (err) {
      console.warn('Failed to load teacher classes:', err);
    }
  }, [formData.class_id]);

  // Load materials with applied filters
  const loadMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedClassId !== 'ALL') params.class_id = selectedClassId;
      if (selectedType !== 'ALL') params.type = selectedType;
      if (selectedStatus !== 'ALL') params.is_published = selectedStatus === 'PUBLISHED';
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiClient.get('/teacher/materials', { params });
      if (res.data?.success) {
        setMaterials(res.data.data || []);
      }
    } catch (err) {
      console.warn('Failed to load materials:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedType, selectedStatus, searchQuery]);

  useEffect(() => {
    loadTeacherClasses();
  }, [loadTeacherClasses]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  // Resync on reconnect
  useEffect(() => {
    return onReconnect(() => {
      loadTeacherClasses();
      loadMaterials();
    });
  }, [onReconnect, loadTeacherClasses, loadMaterials]);

  // Realtime Listeners for Teacher Materials
  useRealtimeEvent('material.created', (data) => {
    setMaterials((prev) => [data, ...prev.filter((m) => m.id !== data.id)]);
    setActionFeedback({
      type: 'success',
      message: `Materi baru '${data.title}' berhasil ditambahkan ke kelas ${data.className || ''}.`
    });
  });

  useRealtimeEvent('material.updated', (data) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === data.id ? { ...m, ...data } : m))
    );
    if (viewingMaterial && viewingMaterial.id === data.id) {
      setViewingMaterial((prev) => ({ ...prev, ...data }));
    }
  });

  useRealtimeEvent('material.deleted', (data) => {
    setMaterials((prev) => prev.filter((m) => m.id !== data.id));
    if (viewingMaterial && viewingMaterial.id === data.id) {
      setViewingMaterial(null);
    }
    setActionFeedback({
      type: 'info',
      message: `Materi '${data.title || 'Materi'}' telah dihapus dari kelas.`
    });
  });

  // Modal open helpers
  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingMaterial(null);
    setFormData({
      class_id: classes.length > 0 ? (selectedClassId !== 'ALL' ? selectedClassId : classes[0].id) : '',
      title: '',
      description: '',
      type: 'file',
      external_url: '',
      is_published: true
    });
    setSelectedFile(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material) => {
    setModalMode('edit');
    setEditingMaterial(material);
    setFormData({
      class_id: material.classId,
      title: material.title,
      description: material.description || '',
      type: material.type,
      external_url: material.externalUrl || '',
      is_published: material.isPublished
    });
    setSelectedFile(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.class_id) {
      setFormError('Silakan pilih kelas bimbingan.');
      return;
    }
    if (!formData.title.trim()) {
      setFormError('Judul materi pembelajaran wajib diisi.');
      return;
    }
    if (formData.type === 'link' && !formData.external_url.trim()) {
      setFormError('URL tautan eksternal wajib diisi untuk tipe link.');
      return;
    }
    if (formData.type === 'text' && !formData.description.trim()) {
      setFormError('Konten/catatan teks materi wajib diisi untuk tipe text.');
      return;
    }
    if (modalMode === 'create' && formData.type === 'file' && !selectedFile) {
      setFormError('Berkas materi wajib diunggah untuk tipe file.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('class_id', formData.class_id);
      data.append('title', formData.title);
      data.append('type', formData.type);
      if (formData.description) data.append('description', formData.description);
      if (formData.external_url) data.append('external_url', formData.external_url);
      data.append('is_published', formData.is_published ? '1' : '0');
      if (selectedFile) {
        data.append('file', selectedFile);
      }

      if (modalMode === 'create') {
        const res = await apiClient.post('/teacher/materials', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.success) {
          setIsModalOpen(false);
          setActionFeedback({ type: 'success', message: 'Materi pembelajaran berhasil ditambahkan.' });
          loadMaterials();
        }
      } else {
        // Edit update
        const res = await apiClient.post(`/teacher/materials/${editingMaterial.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.success) {
          setIsModalOpen(false);
          setActionFeedback({ type: 'success', message: 'Materi pembelajaran berhasil diperbarui.' });
          loadMaterials();
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat menyimpan materi.';
      setFormError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (material) => {
    try {
      const res = await apiClient.match(['put', 'patch'], `/teacher/materials/${material.id}`, {
        is_published: !material.isPublished
      });
      if (res.data?.success) {
        setMaterials((prev) =>
          prev.map((m) => (m.id === material.id ? { ...m, isPublished: !material.isPublished } : m))
        );
        setActionFeedback({
          type: 'success',
          message: `Status materi berhasil diubah menjadi: ${!material.isPublished ? 'Diterbitkan' : 'Draf'}`
        });
      }
    } catch (err) {
      alert('Gagal mengubah status publikasi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Delete material
  const handleDelete = async (material) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus materi "${material.title}"?`)) {
      return;
    }
    try {
      const res = await apiClient.delete(`/teacher/materials/${material.id}`);
      if (res.data?.success) {
        setMaterials((prev) => prev.filter((m) => m.id !== material.id));
        setActionFeedback({ type: 'info', message: 'Materi berhasil dihapus.' });
      }
    } catch (err) {
      alert('Gagal menghapus materi: ' + (err.response?.data?.message || err.message));
    }
  };

  // Secure download
  const handleDownload = async (material) => {
    try {
      const res = await apiClient.get(`/teacher/materials/${material.id}/download`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: material.mimeType || 'application/octet-stream' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', material.originalFilename || `materi-${material.id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert('Gagal mengunduh berkas: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header Banner */}
      <div
        className="student-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderLeft: '4px solid var(--ochre, #B45309)'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--ochre, #B45309)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            <BookOpen size={15} />
            <span>MODUL & DOKUMEN KURIKULUM</span>
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
            Materi Pembelajaran Kelas
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Kelola modul belajar, berkas latihan kanji/choukai, tautan referensi, dan instruksi teks untuk kelas bimbingan Anda.
          </p>
        </div>

        <Button onClick={handleOpenCreate} variant="primary" size="md" icon={Plus}>
          Tambah Materi
        </Button>
      </div>

      {/* 2. Action Feedback Alert */}
      {actionFeedback && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: actionFeedback.type === 'success' ? '#ECFDF5' : '#EFF6FF',
            border: `1px solid ${actionFeedback.type === 'success' ? '#A7F3D0' : '#BFDBFE'}`,
            color: actionFeedback.type === 'success' ? '#065F46' : '#1E40AF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.88rem',
            fontWeight: 500
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} />
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 3. Filter Bar */}
      <div
        className="student-card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1.1rem 1.25rem'
        }}
      >
        {/* Class Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #6B7280)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            Kelas Bimbingan
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border, #E5E7EB)',
              fontSize: '0.88rem',
              backgroundColor: 'var(--surface, #FFF)'
            }}
          >
            <option value="ALL">Semua Kelas Saya ({classes.length})</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.class_name || cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #6B7280)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            Jenis Materi
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border, #E5E7EB)',
              fontSize: '0.88rem',
              backgroundColor: 'var(--surface, #FFF)'
            }}
          >
            <option value="ALL">Semua Jenis</option>
            <option value="file">Berkas Dokumen / File</option>
            <option value="link">Tautan Eksternal (Link)</option>
            <option value="text">Catatan / Teks Materi</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #6B7280)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            Status Publikasi
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border, #E5E7EB)',
              fontSize: '0.88rem',
              backgroundColor: 'var(--surface, #FFF)'
            }}
          >
            <option value="ALL">Semua Status</option>
            <option value="PUBLISHED">Diterbitkan (Aktif)</option>
            <option value="DRAFT">Draf (Disembunyikan)</option>
          </select>
        </div>

        {/* Search Input */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #6B7280)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            Pencarian
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #9CA3AF)' }} />
            <input
              type="text"
              placeholder="Cari judul materi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border, #E5E7EB)',
                fontSize: '0.88rem',
                backgroundColor: 'var(--surface, #FFF)'
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Materials List */}
      <div className="student-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border, #E5E7EB)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Daftar Materi ({materials.length})
          </span>
          <button
            onClick={loadMaterials}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Muat Ulang
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.75rem auto' }} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Memuat daftar materi pembelajaran...</p>
          </div>
        ) : materials.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <BookOpen size={36} style={{ color: 'var(--text-muted, #9CA3AF)', margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
              Belum Ada Materi Pembelajaran
            </h3>
            <p style={{ fontSize: '0.85rem', margin: '0 auto 1.25rem auto', maxWidth: '420px' }}>
              {selectedClassId !== 'ALL' || selectedType !== 'ALL' || selectedStatus !== 'ALL' || searchQuery
                ? 'Tidak ada materi yang sesuai dengan filter yang dipilih.'
                : 'Mulai unggah modul, berkas PDF latihan, atau bagikan tautan belajar untuk siswa binaan Anda.'}
            </p>
            <Button onClick={handleOpenCreate} variant="primary" size="sm" icon={Plus}>
              Tambah Materi Sekarang
            </Button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-muted, #F9FAFB)', borderBottom: '1px solid var(--border, #E5E7EB)', textAlign: 'left', color: 'var(--text-muted, #6B7280)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Judul & Deskripsi</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Kelas</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Jenis</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Ukuran / Sumber</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid var(--border, #F3F4F6)',
                      transition: 'background-color 0.15s'
                    }}
                  >
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                        {item.title}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1rem', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.className || 'Kelas'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1rem', whiteSpace: 'nowrap' }}>
                      {item.type === 'file' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#0284C7', fontSize: '0.82rem', fontWeight: 600 }}>
                          <FileText size={15} /> Berkas
                        </span>
                      )}
                      {item.type === 'link' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#7C3AED', fontSize: '0.82rem', fontWeight: 600 }}>
                          <Link2 size={15} /> Tautan
                        </span>
                      )}
                      {item.type === 'text' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontSize: '0.82rem', fontWeight: 600 }}>
                          <AlignLeft size={15} /> Teks
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {item.type === 'file' && (
                        <span>{formatFileSize(item.fileSize)}</span>
                      )}
                      {item.type === 'link' && (
                        <span style={{ maxWidth: '160px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.externalUrl}
                        </span>
                      )}
                      {item.type === 'text' && (
                        <span>{(item.description || '').length} karakter</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1rem', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => handleTogglePublish(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: 'none',
                          backgroundColor: item.isPublished ? '#DEF7EC' : '#FEF3C7',
                          color: item.isPublished ? '#03543F' : '#92400E'
                        }}
                        title="Klik untuk mengubah status publikasi"
                      >
                        {item.isPublished ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                        {item.isPublished ? 'Diterbitkan' : 'Draf'}
                      </button>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {item.type === 'file' && item.hasFile && (
                          <button
                            onClick={() => handleDownload(item)}
                            title="Unduh Berkas"
                            style={{
                              padding: '0.4rem',
                              borderRadius: 'var(--radius-sm, 6px)',
                              border: '1px solid var(--border, #E5E7EB)',
                              backgroundColor: 'var(--surface, #FFF)',
                              color: '#0284C7',
                              cursor: 'pointer'
                            }}
                          >
                            <Download size={15} />
                          </button>
                        )}
                        {item.type === 'link' && item.externalUrl && (
                          <a
                            href={item.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Buka Tautan Eksternal"
                            style={{
                              padding: '0.4rem',
                              borderRadius: 'var(--radius-sm, 6px)',
                              border: '1px solid var(--border, #E5E7EB)',
                              backgroundColor: 'var(--surface, #FFF)',
                              color: '#7C3AED',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                        <button
                          onClick={() => setViewingMaterial(item)}
                          title="Lihat Detail"
                          style={{
                            padding: '0.4rem',
                            borderRadius: 'var(--radius-sm, 6px)',
                            border: '1px solid var(--border, #E5E7EB)',
                            backgroundColor: 'var(--surface, #FFF)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Ubah Materi"
                          style={{
                            padding: '0.4rem',
                            borderRadius: 'var(--radius-sm, 6px)',
                            border: '1px solid var(--border, #E5E7EB)',
                            backgroundColor: 'var(--surface, #FFF)',
                            color: 'var(--ochre, #B45309)',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          title="Hapus Materi"
                          style={{
                            padding: '0.4rem',
                            borderRadius: 'var(--radius-sm, 6px)',
                            border: '1px solid var(--border, #E5E7EB)',
                            backgroundColor: 'var(--surface, #FFF)',
                            color: '#DC2626',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Create / Edit Material Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: '1rem'
          }}
        >
          <div
            className="student-card"
            style={{
              width: '100%',
              maxWidth: '580px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} style={{ color: 'var(--ochre, #B45309)' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {modalMode === 'create' ? 'Tambah Materi Pembelajaran' : 'Ubah Materi Pembelajaran'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm, 6px)', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Class Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Kelas Binaan <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--border, #D1D5DB)',
                    fontSize: '0.88rem'
                  }}
                  required
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name || cls.name} ({cls.program?.title || 'Program'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Judul Materi <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Modul Bunpou Bab 1-5 (Partikel & Kata Kerja)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--border, #D1D5DB)',
                    fontSize: '0.88rem'
                  }}
                  required
                />
              </div>

              {/* Type Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Jenis Materi <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'file', label: 'Berkas / File', icon: FileText },
                    { id: 'link', label: 'Tautan URL', icon: Link2 },
                    { id: 'text', label: 'Teks Materi', icon: AlignLeft }
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = formData.type === t.id;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setFormData({ ...formData, type: t.id })}
                        style={{
                          padding: '0.65rem 0.5rem',
                          borderRadius: 'var(--radius-sm, 6px)',
                          border: `1.5px solid ${isSelected ? 'var(--ochre, #B45309)' : 'var(--border, #E5E7EB)'}`,
                          backgroundColor: isSelected ? 'var(--surface-muted, #FFFBEB)' : 'var(--surface, #FFF)',
                          color: isSelected ? 'var(--ochre, #B45309)' : 'var(--text-secondary)',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Icon size={16} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* File Upload (for type file) */}
              {formData.type === 'file' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Berkas Dokumen {modalMode === 'create' ? <span style={{ color: '#DC2626' }}>*</span> : '(Biarkan kosong jika tidak mengubah)'}
                  </label>
                  <div
                    style={{
                      border: '2px dashed var(--border, #D1D5DB)',
                      borderRadius: 'var(--radius-md, 8px)',
                      padding: '1.25rem',
                      textAlign: 'center',
                      backgroundColor: 'var(--surface-muted, #F9FAFB)',
                      cursor: 'pointer'
                    }}
                    onClick={() => document.getElementById('material-file-input').click()}
                  >
                    <UploadCloud size={28} style={{ color: 'var(--ochre, #B45309)', margin: '0 auto 0.5rem auto' }} />
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', fontWeight: 600 }}>
                      {selectedFile ? selectedFile.name : (editingMaterial?.originalFilename ? `Berkas saat ini: ${editingMaterial.originalFilename}` : 'Klik untuk memilih berkas dokumen')}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6B7280)' }}>
                      Mendukung PDF, Word, Excel, PPT, ZIP, JPG, PNG, WEBP (Maksimal 20 MB)
                    </span>
                    <input
                      id="material-file-input"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Link URL (for type link) */}
              {formData.type === 'link' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Alamat Tautan Eksternal <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... atau https://youtu.be/..."
                    value={formData.external_url}
                    onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm, 6px)',
                      border: '1px solid var(--border, #D1D5DB)',
                      fontSize: '0.88rem'
                    }}
                    required={formData.type === 'link'}
                  />
                </div>
              )}

              {/* Description / Text Content */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  {formData.type === 'text' ? 'Konten Teks Pembelajaran *' : 'Deskripsi / Instruksi Siswa (Opsional)'}
                </label>
                <textarea
                  rows={formData.type === 'text' ? 6 : 3}
                  placeholder={
                    formData.type === 'text'
                      ? 'Tuliskan daftar kanji, penjelasan pola kalimat bunpou, atau catatan instruksi lengkap di sini...'
                      : 'Catatan tambahan atau instruksi pengerjaan bagi siswa...'
                  }
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--border, #D1D5DB)',
                    fontSize: '0.88rem',
                    fontFamily: 'inherit'
                  }}
                  required={formData.type === 'text'}
                />
              </div>

              {/* Publication Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0' }}>
                <input
                  type="checkbox"
                  id="is_published_chk"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  style={{ width: '17px', height: '17px', cursor: 'pointer' }}
                />
                <label htmlFor="is_published_chk" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Terbitkan langsung agar dapat diakses siswa terdaftar aktif
                </label>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary" size="md">
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : (modalMode === 'create' ? 'Simpan Materi' : 'Perbarui Materi')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. View Detail Modal */}
      {viewingMaterial && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: '1rem'
          }}
        >
          <div
            className="student-card"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '1.75rem',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Eye size={20} style={{ color: 'var(--ochre, #B45309)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Detail Materi Pembelajaran
                </h3>
              </div>
              <button
                onClick={() => setViewingMaterial(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #6B7280)', textTransform: 'uppercase' }}>Judul:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{viewingMaterial.title}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #6B7280)', textTransform: 'uppercase' }}>Kelas:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>{viewingMaterial.className}</div>
              </div>

              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #6B7280)', textTransform: 'uppercase' }}>Jenis:</span>
                  <div style={{ marginTop: '0.15rem', textTransform: 'capitalize' }}>{viewingMaterial.type}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #6B7280)', textTransform: 'uppercase' }}>Status:</span>
                  <div style={{ marginTop: '0.15rem', fontWeight: 700, color: viewingMaterial.isPublished ? '#03543F' : '#92400E' }}>
                    {viewingMaterial.isPublished ? 'Diterbitkan (Aktif)' : 'Draf (Disembunyikan)'}
                  </div>
                </div>
              </div>

              {viewingMaterial.description && (
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #6B7280)', textTransform: 'uppercase' }}>
                    {viewingMaterial.type === 'text' ? 'Konten Teks Pembelajaran:' : 'Deskripsi:'}
                  </span>
                  <div
                    style={{
                      marginTop: '0.35rem',
                      padding: '0.85rem',
                      backgroundColor: 'var(--surface-muted, #F9FAFB)',
                      borderRadius: 'var(--radius-sm, 6px)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {viewingMaterial.description}
                  </div>
                </div>
              )}

              {viewingMaterial.type === 'file' && viewingMaterial.hasFile && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid var(--border, #E5E7EB)', borderRadius: 'var(--radius-sm, 6px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileIcon size={20} style={{ color: '#0284C7' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{viewingMaterial.originalFilename}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatFileSize(viewingMaterial.fileSize)}</div>
                    </div>
                  </div>
                  <Button onClick={() => handleDownload(viewingMaterial)} variant="primary" size="sm" icon={Download}>
                    Unduh
                  </Button>
                </div>
              )}

              {viewingMaterial.type === 'link' && viewingMaterial.externalUrl && (
                <div style={{ marginTop: '0.5rem' }}>
                  <a
                    href={viewingMaterial.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#7C3AED',
                      fontWeight: 600,
                      wordBreak: 'break-all'
                    }}
                  >
                    <ExternalLink size={16} />
                    <span>{viewingMaterial.externalUrl}</span>
                  </a>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <Button onClick={() => setViewingMaterial(null)} variant="secondary" size="sm">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
