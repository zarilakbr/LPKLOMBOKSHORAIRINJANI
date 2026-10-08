import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  BookOpen
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useRealtimeEvent, useRealtime } from '../../context/RealtimeContext';

export default function TeacherSchedulePage() {
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [feedback, setFeedback] = useState(null);

  // Modal State
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [activeItem, setActiveItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    class_id: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '08:30',
    end_time: '11:30',
    location: '',
    notes: '',
    status: 'scheduled'
  });

  const { onReconnect } = useRealtime();

  // Load teacher's classes and schedules
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [classRes, schedRes] = await Promise.allSettled([
        apiClient.get('/teacher/classes'),
        apiClient.get('/teacher/schedule', {
          params: selectedClassId !== 'ALL' ? { class_id: selectedClassId } : {}
        })
      ]);

      if (classRes.status === 'fulfilled' && classRes.value.data?.success) {
        const clsList = classRes.value.data.data || [];
        setClasses(clsList);
      }

      if (schedRes.status === 'fulfilled' && schedRes.value.data?.success) {
        setSchedules(schedRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load teacher schedules:', err);
      setFeedback({ type: 'error', message: 'Gagal memuat jadwal mengajar.' });
    } finally {
      setLoading(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Re-sync on reconnection
  useEffect(() => {
    return onReconnect(() => {
      loadData();
    });
  }, [onReconnect, loadData]);

  // REALTIME LISTENERS
  useRealtimeEvent('schedule.created', (newSched) => {
    setSchedules((prev) => [newSched, ...prev.filter((s) => s.id !== newSched.id)]);
    setFeedback({
      type: 'info',
      message: `Jadwal baru "${newSched.title}" telah ditambahkan secara realtime.`
    });
  });

  useRealtimeEvent('schedule.updated', (updatedSched) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === updatedSched.id ? { ...s, ...updatedSched } : s))
    );
    setFeedback({
      type: 'info',
      message: `Jadwal "${updatedSched.title}" telah diperbarui secara realtime.`
    });
  });

  useRealtimeEvent('schedule.deleted', (deleted) => {
    setSchedules((prev) => prev.filter((s) => s.id !== deleted.id));
    setFeedback({
      type: 'info',
      message: `Jadwal "${deleted.title}" telah dihapus secara realtime.`
    });
  });

  // Handle Open Create
  const handleOpenCreate = () => {
    setFormData({
      class_id: classes.length > 0 ? String(classes[0].id) : '',
      title: '',
      date: new Date().toISOString().split('T')[0],
      start_time: '08:30',
      end_time: '11:30',
      location: 'Ruang Teori 01',
      notes: '',
      status: 'scheduled'
    });
    setActiveItem(null);
    setModalMode('create');
  };

  // Handle Open Edit
  const handleOpenEdit = (item) => {
    setActiveItem(item);
    setFormData({
      class_id: String(item.classId || item.class_id),
      title: item.title,
      date: item.date,
      start_time: item.startTime ? item.startTime.slice(0, 5) : '08:30',
      end_time: item.endTime ? item.endTime.slice(0, 5) : '11:30',
      location: item.location || '',
      notes: item.notes || '',
      status: item.status || 'scheduled'
    });
    setModalMode('edit');
  };

  // Submit Create or Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      if (modalMode === 'create') {
        const res = await apiClient.post('/teacher/schedule', formData);
        if (res.data?.success) {
          setFeedback({ type: 'success', message: 'Sesi jadwal baru berhasil ditambahkan.' });
          setModalMode(null);
          loadData();
        }
      } else if (modalMode === 'edit' && activeItem) {
        const res = await apiClient.patch(`/teacher/schedule/${activeItem.id}`, formData);
        if (res.data?.success) {
          setFeedback({ type: 'success', message: 'Sesi jadwal berhasil diperbarui.' });
          setModalMode(null);
          loadData();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan jadwal. Periksa input data.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Schedule
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await apiClient.delete(`/teacher/schedule/${deleteTarget.id}`);
      if (res.data?.success) {
        setFeedback({ type: 'success', message: 'Sesi jadwal berhasil dihapus.' });
        setDeleteTarget(null);
        loadData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus jadwal.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered list
  const filtered = schedules.filter((s) => {
    if (selectedClassId === 'ALL') return true;
    return String(s.classId || s.class_id) === String(selectedClassId);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Jadwal Mengajar Sensei
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Atur dan kelola sesi pertemuan kelas bimbingan Anda secara terstruktur dan realtime.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          disabled={classes.length === 0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1.1rem',
            backgroundColor: 'var(--vermilion)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: classes.length === 0 ? 'not-allowed' : 'pointer',
            opacity: classes.length === 0 ? 0.6 : 1
          }}
        >
          <Plus size={16} />
          <span>Tambah Sesi Jadwal</span>
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
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          padding: '1rem 1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <Filter size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Filter Kelas:</span>
        </div>

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
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <option value="ALL">Semua Kelas Bimbingan</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.className || cls.name || cls.class_name || `Kelas #${cls.id}`}
            </option>
          ))}
        </select>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          Menampilkan <strong>{filtered.length}</strong> sesi
        </span>
      </div>

      {/* Schedule Grid */}
      {loading ? (
        <div className="student-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Memuat jadwal mengajar...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="student-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <Calendar size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Belum Ada Sesi Jadwal
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Klik tombol "Tambah Sesi Jadwal" di atas untuk menjadwalkan sesi kelas baru.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              className="student-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem',
                borderLeft: '4px solid var(--vermilion)',
                backgroundColor: 'var(--surface)',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--surface-muted)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {item.className || item.class?.name || 'Kelas Bimbingan'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor:
                        item.status === 'ongoing'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : item.status === 'completed'
                          ? 'rgba(100, 116, 139, 0.15)'
                          : 'rgba(59, 130, 246, 0.15)',
                      color:
                        item.status === 'ongoing'
                          ? 'var(--emerald)'
                          : item.status === 'completed'
                          ? 'var(--text-muted)'
                          : 'var(--primary, #2563EB)'
                    }}
                  >
                    {(item.status || 'scheduled').toUpperCase()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                  {item.title}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={14} style={{ color: 'var(--vermilion)' }} />
                    <span>{item.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} style={{ color: 'var(--vermilion)' }} />
                    <span>{item.startTime} - {item.endTime} WITA</span>
                  </div>
                  {item.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} style={{ color: 'var(--vermilion)' }} />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>

                {item.notes && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.75rem 0 0 0', fontStyle: 'italic' }}>
                    "{item.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--surface-muted)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: 'var(--vermilion)',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={13} />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create / Edit */}
      {modalMode && (
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
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {modalMode === 'create' ? 'Tambah Sesi Pertemuan' : 'Edit Sesi Pertemuan'}
              </h2>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Kelas Bimbingan *
                </label>
                <select
                  required
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className || cls.name || cls.class_name || `Kelas #${cls.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Judul Materi / Aktivitas *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  placeholder="Contoh: Bab 12 Dokkai & Kanji Tingkat Menengah"
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Tanggal Sesi *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Jam Mulai *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Jam Selesai *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Ruangan / Lokasi
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    placeholder="Contoh: Ruang Sakura 01"
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Status Sesi
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="scheduled">Terjadwal (Scheduled)</option>
                    <option value="ongoing">Sedang Berlangsung (Ongoing)</option>
                    <option value="completed">Selesai (Completed)</option>
                    <option value="cancelled">Dibatalkan (Cancelled)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Catatan / Instruksi Sesi
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  placeholder="Catatan persiapan buku modul atau ujian..."
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  onClick={() => setModalMode(null)}
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
                    backgroundColor: 'var(--vermilion)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Sesi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
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
              maxWidth: '440px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
              Hapus Sesi Jadwal?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem 0' }}>
              Apakah Anda yakin ingin menghapus jadwal <strong>"{deleteTarget.title}"</strong> ({deleteTarget.date})? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
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
                type="button"
                disabled={submitting}
                onClick={handleDeleteConfirm}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'var(--vermilion)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Menghapus...' : 'Ya, Hapus Sesi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
