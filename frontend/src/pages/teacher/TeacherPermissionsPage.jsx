import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCheck,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  Clock4,
  Paperclip,
  AlertCircle,
  X,
  Eye,
  FileText
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useRealtimeEvent, useRealtime } from '../../context/RealtimeContext';

export default function TeacherPermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Review Modal State
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewAction, setReviewAction] = useState('approved'); // 'approved' | 'rejected'
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal State
  const [viewDetailTarget, setViewDetailTarget] = useState(null);
  const [downloadingAttId, setDownloadingAttId] = useState(null);

  const handleDownloadAttachment = async (permissionId, att) => {
    try {
      setDownloadingAttId(att.id);
      const res = await apiClient.get(`/teacher/permissions/${permissionId}/attachments/${att.id}/download`, {
        responseType: 'blob'
      });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', att.fileName || att.originalFilename || att.file_name || `lampiran-${att.id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
      alert('Gagal mengunduh dokumen lampiran.');
    } finally {
      setDownloadingAttId(null);
    }
  };

  const { onReconnect } = useRealtime();

  // Load teacher classes and permission requests
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [clsRes, permRes] = await Promise.allSettled([
        apiClient.get('/teacher/classes'),
        apiClient.get('/teacher/permissions', {
          params: {
            class_id: selectedClassId !== 'ALL' ? selectedClassId : undefined,
            status: selectedStatus !== 'ALL' ? selectedStatus : undefined
          }
        })
      ]);

      if (clsRes.status === 'fulfilled' && clsRes.value.data?.success) {
        setClasses(clsRes.value.data.data || []);
      }

      if (permRes.status === 'fulfilled' && permRes.value.data?.success) {
        setPermissions(permRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load permissions:', err);
      setFeedback({ type: 'error', message: 'Gagal memuat daftar permohonan izin.' });
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto resync
  useEffect(() => {
    return onReconnect(() => {
      loadData();
    });
  }, [onReconnect, loadData]);

  // REALTIME LISTENERS
  useRealtimeEvent('permission.created', (newPerm) => {
    setPermissions((prev) => [newPerm, ...prev.filter((p) => p.id !== newPerm.id)]);
    setFeedback({
      type: 'info',
      message: `Permohonan izin baru dari ${newPerm.userName || 'Siswa'} telah diterima.`
    });
  });

  useRealtimeEvent('permission.reviewed', (reviewed) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === reviewed.id ? { ...p, ...reviewed } : p))
    );
  });

  // Handle Review Submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewTarget) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await apiClient.patch(`/teacher/permissions/${reviewTarget.id}/review`, {
        status: reviewAction,
        review_notes: reviewNotes
      });

      if (res.data?.success) {
        setFeedback({
          type: 'success',
          message: `Permohonan izin ${reviewAction === 'approved' ? 'DISETUJUI' : 'DITOLAK'}. Presensi kelas diperbarui secara otomatis.`
        });
        setReviewTarget(null);
        setReviewNotes('');
        loadData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan peninjauan izin.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Peninjauan Permohonan Izin Siswa
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
          Tinjau dispensasi izin dan sakit dari siswa kelas bimbingan Anda. Persetujuan otomatis mencatat status presensi siswa.
        </p>
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
            backgroundColor:
              feedback.type === 'error'
                ? 'rgba(239, 68, 68, 0.1)'
                : feedback.type === 'info'
                ? 'rgba(59, 130, 246, 0.1)'
                : 'rgba(16, 185, 129, 0.1)',
            color:
              feedback.type === 'error'
                ? 'var(--vermilion)'
                : feedback.type === 'info'
                ? 'var(--primary, #2563EB)'
                : 'var(--emerald)',
            border: `1px solid ${
              feedback.type === 'error'
                ? 'var(--vermilion-border)'
                : feedback.type === 'info'
                ? 'rgba(59, 130, 246, 0.25)'
                : 'rgba(16, 185, 129, 0.25)'
            }`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div
        className="student-card"
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '1rem 1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Kelas:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <option value="ALL">Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name || cls.class_name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <option value="ALL">Semua Status</option>
            <option value="pending">Menunggu (Pending)</option>
            <option value="approved">Disetujui (Approved)</option>
            <option value="rejected">Ditolak (Rejected)</option>
          </select>
        </div>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          Total: <strong>{permissions.length}</strong> pengajuan
        </span>
      </div>

      {/* Permissions List / Table */}
      <div className="student-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Memuat permohonan izin...</p>
          </div>
        ) : permissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <FileCheck size={38} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Tidak Ada Permohonan Izin
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Belum ada siswa yang mengajukan izin atau sakit pada kelas ini.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Siswa</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Kelas</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tipe</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Periode</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Alasan</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((item, idx) => {
                  const status = (item.status || 'pending').toLowerCase();
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-muted)'
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.userName || item.user?.name || 'Siswa'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.user?.email || ''}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                        {item.className || item.class?.name || 'Kelas'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: item.type === 'sakit' ? 'rgba(147, 51, 234, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                            color: item.type === 'sakit' ? '#9333EA' : 'var(--primary, #2563EB)'
                          }}
                        >
                          {(item.type || 'izin').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {item.startDate || item.start_date} s/d {item.endDate || item.end_date || item.startDate}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.reason}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor:
                              status === 'approved'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : status === 'rejected'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(217, 119, 6, 0.15)',
                            color:
                              status === 'approved'
                                ? 'var(--emerald)'
                                : status === 'rejected'
                                ? 'var(--vermilion)'
                                : 'var(--ochre, #D97706)'
                          }}
                        >
                          {status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => setViewDetailTarget(item)}
                            title="Lihat Rincian"
                            style={{
                              padding: '0.3rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: 'var(--surface)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer'
                            }}
                          >
                            <Eye size={14} />
                          </button>

                          {status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                setReviewTarget(item);
                                setReviewAction('approved');
                                setReviewNotes('');
                              }}
                              style={{
                                padding: '0.3rem 0.65rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                backgroundColor: 'var(--vermilion)',
                                color: '#FFFFFF',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Tinjau
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Tinjau Permohonan Izin
              </h2>
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <div><strong>Siswa:</strong> {reviewTarget.userName || reviewTarget.user?.name}</div>
              <div><strong>Periode:</strong> {reviewTarget.startDate || reviewTarget.start_date} s/d {reviewTarget.endDate || reviewTarget.end_date || reviewTarget.startDate}</div>
              <div><strong>Alasan:</strong> {reviewTarget.reason}</div>
            </div>

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Keputusan Tinjauan *
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setReviewAction('approved')}
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      border: reviewAction === 'approved' ? '2px solid var(--emerald)' : '1px solid var(--border-subtle)',
                      backgroundColor: reviewAction === 'approved' ? 'rgba(16, 185, 129, 0.15)' : 'var(--surface-muted)',
                      color: reviewAction === 'approved' ? 'var(--emerald)' : 'var(--text-secondary)'
                    }}
                  >
                    Setujui (Approved)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('rejected')}
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      border: reviewAction === 'rejected' ? '2px solid var(--vermilion)' : '1px solid var(--border-subtle)',
                      backgroundColor: reviewAction === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'var(--surface-muted)',
                      color: reviewAction === 'rejected' ? 'var(--vermilion)' : 'var(--text-secondary)'
                    }}
                  >
                    Tolak (Rejected)
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Catatan Sensei
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  placeholder="Catatan atau instruksi tugas pengganti..."
                  onChange={(e) => setReviewNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setReviewTarget(null)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--surface-muted)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: reviewAction === 'approved' ? 'var(--emerald)' : 'var(--vermilion)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Keputusan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewDetailTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              maxWidth: '500px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Rincian Permohonan Izin
              </h2>
              <button
                type="button"
                onClick={() => setViewDetailTarget(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div><strong>Siswa:</strong> {viewDetailTarget.userName || viewDetailTarget.user?.name}</div>
              <div><strong>Kelas:</strong> {viewDetailTarget.className || viewDetailTarget.class?.name}</div>
              <div><strong>Tipe:</strong> {(viewDetailTarget.type || '').toUpperCase()}</div>
              <div><strong>Periode:</strong> {viewDetailTarget.startDate || viewDetailTarget.start_date} s/d {viewDetailTarget.endDate || viewDetailTarget.end_date || viewDetailTarget.startDate}</div>
              <div><strong>Alasan:</strong> {viewDetailTarget.reason}</div>
              {viewDetailTarget.reviewNotes && (
                <div><strong>Catatan Reviewer:</strong> {viewDetailTarget.reviewNotes}</div>
              )}
              {viewDetailTarget.attachments && viewDetailTarget.attachments.length > 0 && (
                <div>
                  <strong>Lampiran Dokumen:</strong>
                  <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {viewDetailTarget.attachments.map((att) => (
                      <button
                        type="button"
                        key={att.id}
                        onClick={() => handleDownloadAttachment(viewDetailTarget.id, att)}
                        disabled={downloadingAttId === att.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: 'var(--vermilion)',
                          background: 'none',
                          border: 'none',
                          padding: '0.2rem 0',
                          cursor: 'pointer',
                          fontWeight: 600,
                          textAlign: 'left',
                          fontFamily: 'inherit',
                          fontSize: '0.9rem'
                        }}
                      >
                        <Paperclip size={14} />
                        <span>{downloadingAttId === att.id ? 'Mengunduh berkas...' : (att.fileName || att.originalFilename || att.file_name || 'Lampiran Surat Bukti')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setViewDetailTarget(null)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface-muted)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
