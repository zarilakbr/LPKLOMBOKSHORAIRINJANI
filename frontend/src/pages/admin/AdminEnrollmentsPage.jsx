import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Edit2,
  XCircle,
  AlertCircle,
  CheckCircle2,
  User,
  BookOpen,
  Calendar,
  ArrowRightLeft
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import { enrollmentService, classService, userService } from '../../services/dataService';
import { useRealtimeEvent } from '../../context/RealtimeContext';
import { useSearchParams } from 'react-router-dom';

export default function AdminEnrollmentsPage() {
  const [searchParams] = useSearchParams();
  const classParam = searchParams.get('class_id');
  const [enrollments, setEnrollments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState(classParam || 'ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    if (classParam) {
      setFilterClass(classParam);
    }
  }, [classParam]);

  // Modals
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view' | null
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    user_id: '',
    class_id: '',
    status: 'ACTIVE',
    enrolled_at: new Date().toISOString().slice(0, 10),
    notes: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const [enrRes, clsRes, usrRes] = await Promise.allSettled([
        enrollmentService.getAll(),
        classService.getAll(),
        userService.getAll({ role: 'SISWA' })
      ]);

      if (enrRes.status === 'fulfilled') {
        setEnrollments(Array.isArray(enrRes.value) ? enrRes.value : []);
      }
      if (clsRes.status === 'fulfilled') {
        setClasses(Array.isArray(clsRes.value) ? clsRes.value : []);
      }
      if (usrRes.status === 'fulfilled') {
        const studentUsers = (usrRes.value || []).filter((u) => u.role === 'SISWA');
        setStudents(studentUsers);
      }
    } catch (err) {
      console.error('Failed to load enrollments data:', err);
      setFeedback({ type: 'error', message: 'Gagal memuat data pendaftaran kelas.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime listeners
  useRealtimeEvent('enrollment.created', (newEnr) => {
    setEnrollments((prev) => [newEnr, ...prev.filter((e) => e.id !== newEnr.id)]);
  });

  useRealtimeEvent('enrollment.updated', (updEnr) => {
    setEnrollments((prev) => prev.map((e) => (e.id === updEnr.id ? { ...e, ...updEnr } : e)));
  });

  // Filtered list
  const filtered = (enrollments || []).filter((e) => {
    const studentName = String(e?.userName || e?.user?.name || '').toLowerCase();
    const studentEmail = String(e?.userEmail || e?.user?.email || '').toLowerCase();
    const className = String(e?.className || e?.class?.name || e?.class?.class_name || '').toLowerCase();
    const notes = String(e?.notes || '').toLowerCase();
    const searchTerm = String(search || '').toLowerCase();

    const matchSearch =
      studentName.includes(searchTerm) ||
      studentEmail.includes(searchTerm) ||
      className.includes(searchTerm) ||
      notes.includes(searchTerm);

    const matchClass = filterClass === 'ALL' || String(e?.classId || e?.class_id || '') === String(filterClass);
    const matchStatus = filterStatus === 'ALL' || String(e?.status || '').toUpperCase() === String(filterStatus).toUpperCase();

    return matchSearch && matchClass && matchStatus;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      user_id: students.length > 0 ? String(students[0].id) : '',
      class_id: classes.length > 0 ? String(classes[0].id) : '',
      status: 'ACTIVE',
      enrolled_at: new Date().toISOString().slice(0, 10),
      notes: ''
    });
    setSelectedEnrollment(null);
    setModalMode('create');
  };

  // Open Edit / Transfer Modal
  const handleOpenEdit = (item) => {
    setSelectedEnrollment(item);
    setFormData({
      user_id: String(item.userId || item.user_id || item.user?.id || ''),
      class_id: String(item.classId || item.class_id || item.class?.id || ''),
      status: item.status || 'ACTIVE',
      enrolled_at: item.enrolledAt ? item.enrolledAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
      notes: item.notes || ''
    });
    setModalMode('edit');
  };

  // Submit Save Create/Update
  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);
    try {
      if (modalMode === 'create') {
        await enrollmentService.create(formData);
        setFeedback({ type: 'success', message: 'Siswa berhasil didaftarkan ke kelas.' });
      } else if (modalMode === 'edit' && selectedEnrollment) {
        await enrollmentService.update(selectedEnrollment.id, formData);
        setFeedback({ type: 'success', message: 'Pendaftaran kelas / pemindahan siswa berhasil disimpan.' });
      }
      setModalMode(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menyimpan pendaftaran kelas.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Enrollment Confirm
  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await enrollmentService.delete(cancelTarget.id);
      setFeedback({ type: 'success', message: 'Pendaftaran kelas siswa berhasil dibatalkan.' });
      setCancelTarget(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal membatalkan pendaftaran kelas.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            Manajemen Pendaftaran Kelas (Enrollment Siswa)
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Kelola keanggotaan aktif siswa di setiap rombongan belajar, transfer kelas, dan status kelulusan.
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
            disabled={students.length === 0 || classes.length === 0}
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
              cursor: students.length === 0 || classes.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <Plus size={16} />
            <span>Daftarkan Siswa ke Kelas</span>
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

      {/* Filter Row */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari siswa, email, atau kelas..."
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
          <option value="ACTIVE">Aktif (ACTIVE)</option>
          <option value="COMPLETED">Selesai / Lulus (COMPLETED)</option>
          <option value="CANCELLED">Dibatalkan (CANCELLED)</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={[
          {
            header: 'Siswa Peserta',
            render: (row) => (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.userName || row.user?.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{row.userEmail || row.user?.email}</div>
              </div>
            )
          },
          {
            header: 'Kelas Belajar',
            render: (row) => (
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.className || row.class?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Sensei: {row.teacherName || row.class?.teacher?.name || '-'}
                </div>
              </div>
            )
          },
          {
            header: 'Tanggal Terdaftar',
            render: (row) => (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {row.enrolledAt ? new Date(row.enrolledAt).toLocaleDateString('id-ID') : '-'}
              </span>
            )
          },
          {
            header: 'Status Keanggotaan',
            render: (row) => <StatusBadge status={row.status} />
          },
          {
            header: 'Catatan',
            render: (row) => (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '200px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.notes || '-'}
              </span>
            )
          }
        ]}
        data={filtered}
        totalItems={filtered.length}
        loading={loading}
        onAddNew={handleOpenCreate}
        addNewLabel="Daftarkan Siswa ke Kelas"
        onView={(row) => {
          setSelectedEnrollment(row);
          setModalMode('view');
        }}
        onEdit={handleOpenEdit}
        onDelete={(row) => setCancelTarget(row)}
      />

      {/* MODAL 1: VIEW DETAIL */}
      <Modal
        isOpen={modalMode === 'view' && !!selectedEnrollment}
        onClose={() => setModalMode(null)}
        title="Detail Pendaftaran Kelas Siswa"
        footer={
          <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
            Tutup
          </button>
        }
      >
        {selectedEnrollment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nama Siswa</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedEnrollment.userName || selectedEnrollment.user?.name}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Siswa</div>
                <div>{selectedEnrollment.userEmail || selectedEnrollment.user?.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kelas</div>
                <div style={{ fontWeight: 700 }}>{selectedEnrollment.className || selectedEnrollment.class?.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</div>
                <div><StatusBadge status={selectedEnrollment.status} /></div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tanggal Terdaftar</div>
                <div>{selectedEnrollment.enrolledAt ? new Date(selectedEnrollment.enrolledAt).toLocaleDateString('id-ID') : '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tanggal Berakhir</div>
                <div>{selectedEnrollment.endedAt ? new Date(selectedEnrollment.endedAt).toLocaleDateString('id-ID') : '-'}</div>
              </div>
            </div>

            {selectedEnrollment.notes && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Catatan Admisi:</div>
                <div>{selectedEnrollment.notes}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* MODAL 2: CREATE / EDIT (TRANSFER) ENROLLMENT */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Daftarkan Siswa ke Kelas' : 'Edit / Pindahkan Siswa ke Kelas'}
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="enrollment-form" disabled={actionLoading} className="btn btn-primary btn-sm">
              {actionLoading ? 'Menyimpan...' : 'Simpan Pendaftaran'}
            </button>
          </>
        }
      >
        <form id="enrollment-form" onSubmit={handleSave}>
          {modalMode === 'create' ? (
            <FormField
              label="Pilih Siswa (Role SISWA) *"
              type="select"
              required
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              options={students.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.email})`
              }))}
            />
          ) : (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Siswa
              </label>
              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                {selectedEnrollment?.userName || selectedEnrollment?.user?.name} ({selectedEnrollment?.userEmail || selectedEnrollment?.user?.email})
              </div>
            </div>
          )}

          <FormField
            label="Kelas Rombongan Belajar *"
            type="select"
            required
            value={formData.class_id}
            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
            options={classes.map((c) => ({
              value: c.id,
              label: `${c.className || c.name || c.class_name || `Kelas #${c.id}`} (Sensei: ${c.instructor || c.teacher?.name || '-'})`
            }))}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Status Keanggotaan"
              type="select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'ACTIVE (Aktif Belajar)' },
                { value: 'COMPLETED', label: 'COMPLETED (Lulus / Selesai)' },
                { value: 'CANCELLED', label: 'CANCELLED (Dibatalkan)' }
              ]}
            />

            <FormField
              label="Tanggal Masuk Kelas"
              type="date"
              value={formData.enrolled_at}
              onChange={(e) => setFormData({ ...formData, enrolled_at: e.target.value })}
            />
          </div>

          <FormField
            label="Catatan Administrasi"
            type="textarea"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Catatan penempatan kelas, pemindahan rombel, atau beasiswa..."
          />
        </form>
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        title="Batalkan Pendaftaran Kelas"
        message={`Apakah Anda yakin ingin membatalkan keanggotaan kelas untuk siswa ${cancelTarget?.userName || cancelTarget?.user?.name} di kelas ${cancelTarget?.className || cancelTarget?.class?.name}? Status pendaftaran akan diubah menjadi CANCELLED secara aman.`}
        confirmLabel="Batalkan Pendaftaran"
        cancelLabel="Kembali"
        isDanger
      />
    </div>
  );
}
