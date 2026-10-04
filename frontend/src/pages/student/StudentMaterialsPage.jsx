import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Search,
  FileText,
  Link2,
  AlignLeft,
  Download,
  ExternalLink,
  Eye,
  Calendar,
  User,
  Sparkles,
  X,
  File as FileIcon,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useRealtimeEvent, useRealtime } from '../../context/RealtimeContext';
import Button from '../../components/common/Button';

export default function StudentMaterialsPage() {
  const [classes, setClasses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingMaterial, setViewingMaterial] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [realtimeNotification, setRealtimeNotification] = useState(null);

  const { onReconnect } = useRealtime();

  // Load student's active enrolled classes
  const loadEnrolledClasses = useCallback(async () => {
    try {
      const res = await apiClient.get('/student/classes');
      if (res.data?.success) {
        setClasses(res.data.data || []);
      }
    } catch (err) {
      console.warn('Failed to load student classes:', err);
    }
  }, []);

  // Load published materials from active enrolled classes
  const loadMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedClassId !== 'ALL') params.class_id = selectedClassId;
      if (selectedType !== 'ALL') params.type = selectedType;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiClient.get('/student/materials', { params });
      if (res.data?.success) {
        setMaterials(res.data.data || []);
      }
    } catch (err) {
      console.warn('Failed to load student materials:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedType, searchQuery]);

  useEffect(() => {
    loadEnrolledClasses();
  }, [loadEnrolledClasses]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  useEffect(() => {
    return onReconnect(() => {
      loadEnrolledClasses();
      loadMaterials();
    });
  }, [onReconnect, loadEnrolledClasses, loadMaterials]);

  // Realtime Listeners for Student
  useRealtimeEvent('material.created', (data) => {
    // Only show if published
    if (data.isPublished) {
      setMaterials((prev) => [data, ...prev.filter((m) => m.id !== data.id)]);
      setRealtimeNotification({
        type: 'new',
        message: `Materi baru '${data.title}' telah diterbitkan untuk kelas ${data.className || ''}.`
      });
    }
  });

  useRealtimeEvent('material.updated', (data) => {
    if (!data.isPublished) {
      // If teacher unpublished the material, immediately remove it from student view
      setMaterials((prev) => prev.filter((m) => m.id !== data.id));
      if (viewingMaterial && viewingMaterial.id === data.id) {
        setViewingMaterial(null);
      }
    } else {
      // Update in place
      setMaterials((prev) =>
        prev.map((m) => (m.id === data.id ? { ...m, ...data } : m))
      );
      if (viewingMaterial && viewingMaterial.id === data.id) {
        setViewingMaterial((prev) => ({ ...prev, ...data }));
      }
    }
  });

  useRealtimeEvent('material.deleted', (data) => {
    setMaterials((prev) => prev.filter((m) => m.id !== data.id));
    if (viewingMaterial && viewingMaterial.id === data.id) {
      setViewingMaterial(null);
    }
  });

  // Secure File Download via authenticated endpoint
  const handleDownload = async (material) => {
    setDownloadingId(material.id);
    try {
      const res = await apiClient.get(`/student/materials/${material.id}/download`, {
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
      alert('Gagal mengunduh berkas materi: ' + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
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
            <Sparkles size={15} />
            <span>SUMBER BELAJAR & KURIKULUM</span>
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
            Materi Pembelajaran Saya
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            Akses modul resmi, lembar latihan kanji, choukai, referensi video, dan materi ajar dari sensei untuk kelas aktif Anda.
          </p>
        </div>
      </div>

      {/* 2. Realtime Notification Alert */}
      {realtimeNotification && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1E40AF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.88rem',
            fontWeight: 500
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen size={18} />
            <span>{realtimeNotification.message}</span>
          </div>
          <button
            onClick={() => setRealtimeNotification(null)}
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          padding: '1.1rem 1.25rem'
        }}
      >
        {/* Class Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #6B7280)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            Filter Kelas
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
            <option value="ALL">Semua Kelas Aktif Saya ({classes.length})</option>
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
            Tipe Materi
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
            <option value="ALL">Semua Tipe</option>
            <option value="file">Dokumen Berkas (File)</option>
            <option value="link">Tautan Referensi (Link)</option>
            <option value="text">Catatan Ajar (Teks)</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #6B7280)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            Cari Materi
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

      {/* 4. Materials Grid / List */}
      {loading ? (
        <div className="student-card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw size={26} className="spin" style={{ margin: '0 auto 0.75rem auto' }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Memuat materi pembelajaran kelas...</p>
        </div>
      ) : materials.length === 0 ? (
        <div className="student-card" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <BookOpen size={42} style={{ color: 'var(--text-muted, #9CA3AF)', margin: '0 auto 0.85rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            Belum Ada Materi Diterbitkan
          </h3>
          <p style={{ fontSize: '0.88rem', margin: 0, maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
            {classes.length === 0
              ? 'Anda belum memiliki kelas aktif yang terdaftar. Hubungi bagian akademik LPK untuk verifikasi enrollment kelas.'
              : 'Sensei belum mempublikasikan materi pembelajaran untuk kelas ini. Materi baru akan otomatis muncul di sini secara realtime.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {materials.map((item) => (
            <div
              key={item.id}
              className="student-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.35rem',
                gap: '1rem',
                borderTop: `3px solid ${
                  item.type === 'file' ? '#0284C7' : (item.type === 'link' ? '#7C3AED' : '#059669')
                }`
              }}
            >
              <div>
                {/* Header: Class & Type Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      backgroundColor: 'var(--surface-muted, #F3F4F6)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {item.className || 'Kelas'}
                  </span>

                  {item.type === 'file' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#0284C7' }}>
                      <FileText size={13} /> Dokumen File
                    </span>
                  )}
                  {item.type === 'link' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#7C3AED' }}>
                      <Link2 size={13} /> Tautan URL
                    </span>
                  )}
                  {item.type === 'text' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
                      <AlignLeft size={13} /> Catatan Teks
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.45rem 0', lineHeight: 1.35 }}>
                  {item.title}
                </h3>

                {/* Description */}
                {item.description && (
                  <p
                    style={{
                      fontSize: '0.84rem',
                      color: 'var(--text-secondary)',
                      margin: '0 0 0.85rem 0',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {item.description}
                  </p>
                )}

                {/* Metadata: Teacher & Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted, #6B7280)', marginTop: '0.5rem' }}>
                  {item.teacherName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={13} />
                      <span>Oleh Sensei: {item.teacherName}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={13} />
                    <span>Diterbitkan: {formatDate(item.publishedAt || item.createdAt)}</span>
                  </div>
                  {item.type === 'file' && item.fileSize && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileIcon size={13} />
                      <span>Ukuran: {formatFileSize(item.fileSize)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border, #F3F4F6)', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                {item.type === 'file' && (
                  <Button
                    onClick={() => handleDownload(item)}
                    variant="primary"
                    size="sm"
                    icon={Download}
                    disabled={downloadingId === item.id}
                  >
                    {downloadingId === item.id ? 'Mengunduh...' : 'Unduh Berkas'}
                  </Button>
                )}

                {item.type === 'link' && item.externalUrl && (
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <Button variant="primary" size="sm" icon={ExternalLink}>
                      Buka Tautan
                    </Button>
                  </a>
                )}

                {item.type === 'text' && (
                  <Button
                    onClick={() => setViewingMaterial(item)}
                    variant="primary"
                    size="sm"
                    icon={Eye}
                  >
                    Baca Materi
                  </Button>
                )}

                {item.type !== 'text' && item.description && (
                  <Button
                    onClick={() => setViewingMaterial(item)}
                    variant="secondary"
                    size="sm"
                    icon={Eye}
                  >
                    Detail
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Read / Detail Modal */}
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
              maxWidth: '560px',
              padding: '1.75rem',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} style={{ color: 'var(--ochre, #B45309)' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {viewingMaterial.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingMaterial(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div><strong>Kelas:</strong> {viewingMaterial.className}</div>
                <div><strong>Pengajar:</strong> {viewingMaterial.teacherName || 'Sensei'}</div>
                <div><strong>Tanggal:</strong> {formatDate(viewingMaterial.publishedAt || viewingMaterial.createdAt)}</div>
              </div>

              {viewingMaterial.description && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #6B7280)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    {viewingMaterial.type === 'text' ? 'Konten Teks Pembelajaran:' : 'Petunjuk / Catatan Materi:'}
                  </label>
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--surface-muted, #F9FAFB)',
                      borderRadius: 'var(--radius-sm, 6px)',
                      border: '1px solid var(--border, #E5E7EB)',
                      lineHeight: 1.65,
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.9rem'
                    }}
                  >
                    {viewingMaterial.description}
                  </div>
                </div>
              )}

              {viewingMaterial.type === 'file' && viewingMaterial.hasFile && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 'var(--radius-sm, 6px)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <FileIcon size={22} style={{ color: '#0284C7' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0369A1' }}>{viewingMaterial.originalFilename}</div>
                      <div style={{ fontSize: '0.75rem', color: '#0284C7' }}>{formatFileSize(viewingMaterial.fileSize)}</div>
                    </div>
                  </div>
                  <Button onClick={() => handleDownload(viewingMaterial)} variant="primary" size="sm" icon={Download}>
                    Unduh File
                  </Button>
                </div>
              )}

              {viewingMaterial.type === 'link' && viewingMaterial.externalUrl && (
                <div style={{ padding: '0.85rem', backgroundColor: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: 'var(--radius-sm, 6px)' }}>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
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
