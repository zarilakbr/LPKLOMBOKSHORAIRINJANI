import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
  Paperclip,
  User,
  GraduationCap
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import FormField from '../../components/admin/FormField';
import { permissionService, classService } from '../../services/dataService';
import { useRealtimeEvent } from '../../context/RealtimeContext';

export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');

  // Modals
  const [modalMode, setModalMode] = useState(null); // 'view' | 'reject' | null
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const params = {};
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (filterType !== 'ALL') params.type = filterType;
      if (filterClass !== 'ALL') params.class_id = filterClass;

      const [permRes, clsRes] = await Promise.allSettled([
        permissionService.getAll(params),
        classService.getAll()
      ]);

      if (permRes.status === 'fulfilled') {
        setPermissions(Array.isArray(permRes.value) ? permRes.value : []);
      }
      if (clsRes.status === 'fulfilled') {
        setClasses(Array.isArray(clsRes.value) ? clsRes.value : []);
      }
    } catch (err) {
      console.error('Failed to load permissions:', err);
      setFeedback({ type: 'error', message: 'Gagal memuat permohonan izin siswa.' });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType, filterClass]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime event
  useRealtimeEvent('permission.reviewed', (reviewedItem) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === reviewedItem.id ? { ...p, ...reviewedItem } : p))
    );
  });

  const filtered = (permissions || []).filter((p) => {
    const studentName = String(p?.userName || p?.user?.name || '').toLowerCase();
    const studentEmail = String(p?.userEmail || p?.user?.email || '').toLowerCase();
    const className = String(p?.className || p?.class?.name || '').toLowerCase();
    const reason = String(p?.reason || '').toLowerCase();
    const searchTerm = String(search || '').toLowerCase();

    return (
      studentName.includes(searchTerm) ||
      studentEmail.includes(searchTerm) ||
      className.includes(searchTerm) ||
      reason.includes(searchTerm)
    );
  });

  // Action: Approve
  const handleApprove = async (perm) => {
    if (!perm) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await permissionService.approve(perm.id, 'Disetujui oleh Administrator');
      setFeedback({
        type: 'success',
        message: `Permohonan izin #${perm.id} (${perm.userName || perm.user?.name}) berhasil disetujui. Presensi siswa telah disesuaikan secara otomatis.`
      });
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menyetujui izin.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Open Reject Modal
  const handleOpenReject = (perm) => {
    setSelectedPermission(perm);
    setRejectReason('');
    setRejectError('');
    setModalMode('reject');
  };

  // Action: Submit Reject
  const handleSubmitReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setRejectError('Alasan penolakan izin wajib diisi.');
      return;
    }

    setActionLoading(true);
    setRejectError('');
    try {
      await permissionService.reject(selectedPermission.id, rejectReason.trim());
      setFeedback({
        type: 'success',
        message: `Permohonan izin #${selectedPermission.id} berhasil ditolak dengan alasan tersimpan.`
      });
      setModalMode(null);
      setSelectedPermission(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menolak permohonan izin.';
      setRejectError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Download Attachment
  const handleDownloadAttachment = async (permId, attId, fileName) => {
    try {
      const blobData = await permissionService.downloadAttachment(permId, attId);
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `lampiran-izin-${permId}-${attId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Gagal mengunduh lampiran: ' + (err.response?.data?.message || err.message)
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            Manajemen Permohonan Izin & Sakit Siswa
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Tinjau pengajuan surat dokter dan izin ketidakhadiran siswa dengan sinkronisasi otomatis ke buku presensi.
          </p>
        </div>

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

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari siswa, email, atau alasan..."
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.2rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              boxSizing: 'border-box'
            }}
          />
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

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
          <option value="pending">Menunggu Review (PENDING)</option>
          <option value="approved">Disetujui (APPROVED)</option>
          <option value="rejected">Ditolak (REJECTED)</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="ALL">Semua Jenis</option>
          <option value="sakit">Sakit</option>
          <option value="izin">Izin</option>
        </select>

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
              {c.className || c.name || c.class_name || `Kelas #${c.id}`}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={[
          {
            header: 'Siswa & Kelas',
            render: (row) => (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.userName || row.user?.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{row.className || row.class?.name}</div>
              </div>
            )
          },
          {
            header: 'Jenis',
            render: (row) => (
              <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.82rem' }}>
                {row.type}
              </span>
            )
          },
          {
            header: 'Rentang Tanggal',
            render: (row) => (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {row.startDate ? new Date(row.startDate).toLocaleDateString('id-ID') : '-'}
                {row.endDate && row.endDate !== row.startDate ? ` s/d ${new Date(row.endDate).toLocaleDateString('id-ID')}` : ''}
              </span>
            )
          },
          {
            header: 'Status',
            render: (row) => <StatusBadge status={row.status ? row.status.toUpperCase() : 'PENDING'} />
          },
          {
            header: 'Alasan',
            render: (row) => (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '220px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.reason}
              </span>
            )
          },
          {
            header: 'Lampiran',
            render: (row) => (
              <span style={{ fontSize: '0.8rem' }}>
                {row.attachments && row.attachments.length > 0 ? (
                  <span style={{ color: '#0284C7', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                    <Paperclip size={13} /> {row.attachments.length} Dokumen
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Tidak ada</span>
                )}
              </span>
            )
          },
          {
            header: 'Aksi Review',
            render: (row) => (
              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPermission(row);
                    setModalMode('view');
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem' }}
                  title="Lihat Detail & Dokumen"
                >
                  <Eye size={13} />
                  <span>Detail</span>
                </button>

                {row.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprove(row)}
                      disabled={actionLoading}
                      className="btn btn-sm"
                      style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem', backgroundColor: 'var(--emerald)', color: '#FFF' }}
                      title="Setujui Izin"
                    >
                      <CheckCircle2 size={13} />
                      <span>Setujui</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReject(row)}
                      disabled={actionLoading}
                      className="btn btn-sm"
                      style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem', backgroundColor: 'var(--vermilion)', color: '#FFF' }}
                      title="Tolak Izin"
                    >
                      <XCircle size={13} />
                      <span>Tolak</span>
                    </button>
                  </>
                )}
              </div>
            )
          }
        ]}
        data={filtered}
        totalItems={filtered.length}
        loading={loading}
      />

      {/* MODAL 1: VIEW DETAIL */}
      <Modal
        isOpen={modalMode === 'view' && !!selectedPermission}
        onClose={() => setModalMode(null)}
        title="Detail Permohonan Izin Siswa"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div>
              {selectedPermission?.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode(null);
                      handleApprove(selectedPermission);
                    }}
                    className="btn btn-sm"
                    style={{ backgroundColor: 'var(--emerald)', color: '#FFF' }}
                  >
                    Setujui Izin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenReject(selectedPermission)}
                    className="btn btn-sm"
                    style={{ backgroundColor: 'var(--vermilion)', color: '#FFF' }}
                  >
                    Tolak Izin
                  </button>
                </div>
              )}
            </div>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Tutup
            </button>
          </div>
        }
      >
        {selectedPermission && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nama Siswa</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedPermission.userName || selectedPermission.user?.name}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kelas</div>
                <div style={{ fontWeight: 600 }}>{selectedPermission.className || selectedPermission.class?.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Jenis Izin</div>
                <div style={{ textTransform: 'capitalize', fontWeight: 600 }}>{selectedPermission.type}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status Persetujuan</div>
                <div><StatusBadge status={selectedPermission.status ? selectedPermission.status.toUpperCase() : 'PENDING'} /></div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mulai Tanggal</div>
                <div>{selectedPermission.startDate ? new Date(selectedPermission.startDate).toLocaleDateString('id-ID') : '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sampai Tanggal</div>
                <div>{selectedPermission.endDate ? new Date(selectedPermission.endDate).toLocaleDateString('id-ID') : '-'}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Alasan Siswa:</div>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                {selectedPermission.reason}
              </div>
            </div>

            {selectedPermission.reviewNotes && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Catatan Peninjauan:</div>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  {selectedPermission.reviewNotes}
                </div>
              </div>
            )}

            {/* Attachments Section */}
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 700 }}>
                Dokumen Bukti Lampiran:
              </div>
              {selectedPermission.attachments && selectedPermission.attachments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {selectedPermission.attachments.map((att) => (
                    <div
                      key={att.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        <Paperclip size={14} style={{ color: '#0284C7', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {att.fileName || att.file_name || `Lampiran #${att.id}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadAttachment(selectedPermission.id, att.id, att.fileName || att.file_name)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                      >
                        <Download size={12} />
                        <span>Unduh</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Tidak ada dokumen surat dokter / lampiran yang diunggah.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: REJECT PERMISSION */}
      <Modal
        isOpen={modalMode === 'reject' && !!selectedPermission}
        onClose={() => setModalMode(null)}
        title="Tolak Permohonan Izin"
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button
              type="submit"
              form="reject-permission-form"
              disabled={actionLoading}
              className="btn btn-sm"
              style={{ backgroundColor: 'var(--vermilion)', color: '#FFF' }}
            >
              {actionLoading ? 'Menyimpan...' : 'Tolak Permohonan'}
            </button>
          </>
        }
      >
        <form id="reject-permission-form" onSubmit={handleSubmitReject}>
          {rejectError && (
            <div style={{ padding: '0.5rem 0.75rem', marginBottom: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--vermilion)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              {rejectError}
            </div>
          )}

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Anda akan menolak permohonan izin dari <strong>{selectedPermission?.userName || selectedPermission?.user?.name}</strong>. Wajib memberikan alasan penolakan yang jelas.
          </p>

          <FormField
            label="Alasan Penolakan Izin *"
            type="textarea"
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Jelaskan alasan penolakan, misal: surat keterangan dokter tidak terbaca, masa izin melewati batas maksimal, dsb."
          />
        </form>
      </Modal>
    </div>
  );
}
