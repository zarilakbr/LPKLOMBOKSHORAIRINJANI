import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardCheck,
  Plus,
  RefreshCw,
  Search,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  GraduationCap
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import { attendanceService, classService, userService } from '../../services/dataService';
import { useRealtimeEvent } from '../../context/RealtimeContext';

export default function AdminAttendancePage() {
  const [attendances, setAttendances] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');

  // Modals
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view' | null
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    user_id: '',
    class_id: '',
    attendance_date: new Date().toISOString().slice(0, 10),
    status: 'hadir',
    notes: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const params = {};
      if (filterClass !== 'ALL') params.class_id = filterClass;
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (filterDate) params.date = filterDate;

      const [attRes, clsRes, usrRes] = await Promise.allSettled([
        attendanceService.getAll(params),
        classService.getAll(),
        userService.getAll({ role: 'SISWA' })
      ]);

      if (attRes.status === 'fulfilled') {
        setAttendances(Array.isArray(attRes.value) ? attRes.value : []);
      }
      if (clsRes.status === 'fulfilled') {
        setClasses(Array.isArray(clsRes.value) ? clsRes.value : []);
      }
      if (usrRes.status === 'fulfilled') {
        const studentUsers = (usrRes.value || []).filter((u) => u.role === 'SISWA');
        setStudents(studentUsers);
      }
    } catch (err) {
      console.error('Failed to load attendance data:', err);
      setFeedback({ type: 'error', message: 'Gagal memuat rekap presensi siswa.' });
    } finally {
      setLoading(false);
    }
  }, [filterClass, filterStatus, filterDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime events
  useRealtimeEvent('attendance.recorded', (newAtt) => {
    setAttendances((prev) => [newAtt, ...prev.filter((a) => a.id !== newAtt.id)]);
  });

  useRealtimeEvent('attendance.updated', (updAtt) => {
    setAttendances((prev) => prev.map((a) => (a.id === updAtt.id ? { ...a, ...updAtt } : a)));
  });

  const filtered = (attendances || []).filter((a) => {
    const studentName = String(a?.userName || '').toLowerCase();
    const studentEmail = String(a?.userEmail || '').toLowerCase();
    const className = String(a?.className || '').toLowerCase();
    const notes = String(a?.notes || '').toLowerCase();
    const searchTerm = String(search || '').toLowerCase();

    return (
      studentName.includes(searchTerm) ||
      studentEmail.includes(searchTerm) ||
      className.includes(searchTerm) ||
      notes.includes(searchTerm)
    );
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      user_id: students.length > 0 ? String(students[0].id) : '',
      class_id: classes.length > 0 ? String(classes[0].id) : '',
      attendance_date: new Date().toISOString().slice(0, 10),
      status: 'hadir',
      notes: ''
    });
    setSelectedItem(null);
    setModalMode('create');
  };

  // Open Edit / Koreksi Modal
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      user_id: String(item.userId || ''),
      class_id: String(item.classId || ''),
      attendance_date: item.attendanceDate || new Date().toISOString().slice(0, 10),
      status: item.status || 'hadir',
      notes: item.notes || ''
    });
    setModalMode('edit');
  };

  // Save Create / Koreksi
  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);
    try {
      if (modalMode === 'create') {
        await attendanceService.create(formData);
        setFeedback({ type: 'success', message: 'Data presensi siswa berhasil dicatat.' });
      } else if (modalMode === 'edit' && selectedItem) {
        await attendanceService.update(selectedItem.id, formData);
        setFeedback({ type: 'success', message: 'Koreksi presensi siswa berhasil disimpan.' });
      }
      setModalMode(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menyimpan data presensi.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await attendanceService.delete(deleteTarget.id);
      setFeedback({ type: 'success', message: 'Data presensi siswa berhasil dihapus.' });
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menghapus data presensi.';
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
            Manajemen Presensi Siswa (LMS Attendance)
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Audit rekap presensi kehadiran harian, waktu check-in, dan koreksi catatan absensi peserta pelatihan.
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
            <span>Catat Presensi Manual</span>
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
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
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
          <option value="hadir">Hadir (HADIR)</option>
          <option value="terlambat">Terlambat (TERLAMBAT)</option>
          <option value="izin">Izin (IZIN)</option>
          <option value="sakit">Sakit (SAKIT)</option>
          <option value="alpa">Alpa / Tanpa Keterangan (ALPA)</option>
        </select>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)'
          }}
        />

        {filterDate && (
          <button
            type="button"
            onClick={() => setFilterDate('')}
            className="btn btn-outline btn-sm"
          >
            Reset Tanggal
          </button>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={[
          {
            header: 'Siswa Peserta',
            render: (row) => (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.userName}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{row.userEmail}</div>
              </div>
            )
          },
          {
            header: 'Kelas Belajar',
            render: (row) => (
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.className}</span>
            )
          },
          {
            header: 'Tanggal Presensi',
            render: (row) => (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {row.attendanceDate ? new Date(row.attendanceDate).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
              </span>
            )
          },
          {
            header: 'Check-In',
            render: (row) => (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {row.checkInAt ? row.checkInAt.slice(11, 16) : '-'}
              </span>
            )
          },
          {
            header: 'Status Kehadiran',
            render: (row) => <StatusBadge status={row.status ? row.status.toUpperCase() : 'HADIR'} />
          },
          {
            header: 'Catatan',
            render: (row) => (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '180px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.notes || '-'}
              </span>
            )
          }
        ]}
        data={filtered}
        totalItems={filtered.length}
        loading={loading}
        onAddNew={handleOpenCreate}
        addNewLabel="Catat Presensi Manual"
        onView={(row) => {
          setSelectedItem(row);
          setModalMode('view');
        }}
        onEdit={handleOpenEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      {/* MODAL 1: VIEW DETAIL */}
      <Modal
        isOpen={modalMode === 'view' && !!selectedItem}
        onClose={() => setModalMode(null)}
        title="Detail Presensi Siswa"
        footer={
          <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
            Tutup
          </button>
        }
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nama Siswa</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedItem.userName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Siswa</div>
                <div>{selectedItem.userEmail}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Kelas</div>
                <div style={{ fontWeight: 700 }}>{selectedItem.className}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status Presensi</div>
                <div><StatusBadge status={selectedItem.status ? selectedItem.status.toUpperCase() : 'HADIR'} /></div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tanggal</div>
                <div>{selectedItem.attendanceDate || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Waktu Check-In</div>
                <div>{selectedItem.checkInAt || '-'}</div>
              </div>
            </div>

            {selectedItem.notes && (
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Catatan / Keterangan:</div>
                <div>{selectedItem.notes}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* MODAL 2: CREATE / EDIT (KOREKSI) ATTENDANCE */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Catat Presensi Siswa' : 'Koreksi Data Presensi Siswa'}
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="attendance-form" disabled={actionLoading} className="btn btn-primary btn-sm">
              {actionLoading ? 'Menyimpan...' : 'Simpan Presensi'}
            </button>
          </>
        }
      >
        <form id="attendance-form" onSubmit={handleSave}>
          {modalMode === 'create' ? (
            <FormField
              label="Pilih Siswa *"
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
                {selectedItem?.userName} ({selectedItem?.userEmail})
              </div>
            </div>
          )}

          {modalMode === 'create' ? (
            <FormField
              label="Kelas *"
              type="select"
              required
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              options={classes.map((c) => ({
                value: c.id,
                label: `${c.className || c.name}`
              }))}
            />
          ) : (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Kelas
              </label>
              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                {selectedItem?.className}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Tanggal Presensi *"
              type="date"
              required
              value={formData.attendance_date}
              onChange={(e) => setFormData({ ...formData, attendance_date: e.target.value })}
            />

            <FormField
              label="Status Kehadiran *"
              type="select"
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'hadir', label: 'Hadir (HADIR)' },
                { value: 'terlambat', label: 'Terlambat (TERLAMBAT)' },
                { value: 'izin', label: 'Izin (IZIN)' },
                { value: 'sakit', label: 'Sakit (SAKIT)' },
                { value: 'alpa', label: 'Alpa (ALPA)' }
              ]}
            />
          </div>

          <FormField
            label="Catatan / Alasan Koreksi"
            type="textarea"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Keterangan kehadiran atau alasan koreksi data oleh Admin..."
          />
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Rekap Presensi"
        message={`Apakah Anda yakin ingin menghapus data presensi ${deleteTarget?.userName} untuk tanggal ${deleteTarget?.attendanceDate}? Tindakan ini dicatat dalam log aktivitas.`}
        confirmLabel="Hapus Presensi"
        cancelLabel="Batal"
        isDanger
      />
    </div>
  );
}
