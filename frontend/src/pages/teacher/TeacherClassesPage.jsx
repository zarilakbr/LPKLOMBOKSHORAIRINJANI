import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Users,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  ArrowRight,
  ClipboardCheck,
  Plus,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  Info,
  FileText,
  UserCheck,
  Layers,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { teacherClassService, programService } from '../../services/dataService';
import { useRealtimeEvent, useRealtime } from '../../context/RealtimeContext';
import Modal from '../../components/admin/Modal';
import FormField from '../../components/admin/FormField';
import StatusBadge from '../../components/admin/StatusBadge';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Modal states
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'detail' | null
  const [selectedClass, setSelectedClass] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Detail Modal Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'sessions' | 'materials' | 'attendance'
  const [tabLoading, setTabLoading] = useState(false);
  const [tabData, setTabData] = useState({
    students: [],
    sessions: [],
    materials: [],
    attendance: []
  });

  // Quick Action: Add Session Modal
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [sessionFormData, setSessionFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '08:30',
    end_time: '11:30',
    location: '',
    status: 'SCHEDULED',
    notes: ''
  });

  // Form State for Class Create / Edit
  const [formData, setFormData] = useState({
    className: '',
    programId: '',
    level: 'N5 Beginner',
    schedule: 'Senin - Kamis, 08.30 - 12.00 WIB',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    capacity: 20,
    location: 'Ruang Teori 1 (Lt. 2)',
    status: 'OPEN',
    description: ''
  });

  const { onReconnect } = useRealtime();

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [classRes, progRes] = await Promise.allSettled([
        teacherClassService.getAll(),
        programService.getAll()
      ]);

      if (classRes.status === 'fulfilled') {
        setClasses(Array.isArray(classRes.value) ? classRes.value : []);
      } else {
        setError('Gagal memuat kelas bimbingan.');
      }

      if (progRes.status === 'fulfilled') {
        setPrograms(Array.isArray(progRes.value) ? progRes.value : []);
      }
    } catch (err) {
      console.error('Failed to load teacher classes:', err);
      setError('Gagal memuat kelas bimbingan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Realtime Listeners for Class & Schedule changes
  useRealtimeEvent('class.created', (newClass) => {
    setClasses((prev) => {
      if (prev.some((c) => c.id === newClass.id)) return prev;
      return [newClass, ...prev];
    });
  });

  useRealtimeEvent('class.updated', (updatedClass) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === updatedClass.id ? { ...c, ...updatedClass } : c))
    );
    if (selectedClass && selectedClass.id === updatedClass.id) {
      setSelectedClass((prev) => ({ ...prev, ...updatedClass }));
    }
  });

  useRealtimeEvent('class.deleted', (deleted) => {
    const deletedId = deleted?.id ?? deleted;
    setClasses((prev) => prev.filter((c) => c.id !== deletedId));
    if (selectedClass && selectedClass.id === deletedId) {
      setModalMode(null);
      setSelectedClass(null);
    }
  });

  useRealtimeEvent('schedule.created', (newSession) => {
    if (selectedClass && newSession.classId === selectedClass.id) {
      setTabData((prev) => ({
        ...prev,
        sessions: [newSession, ...prev.sessions.filter((s) => s.id !== newSession.id)]
      }));
    }
  });

  useRealtimeEvent('schedule.updated', (updatedSession) => {
    if (selectedClass && updatedSession.classId === selectedClass.id) {
      setTabData((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s))
      }));
    }
  });

  useRealtimeEvent('schedule.deleted', (deletedSession) => {
    const sId = deletedSession?.id ?? deletedSession;
    if (selectedClass) {
      setTabData((prev) => ({
        ...prev,
        sessions: prev.sessions.filter((s) => s.id !== sId)
      }));
    }
  });

  useEffect(() => {
    if (!onReconnect) return;
    const unsub = onReconnect(() => {
      loadClasses();
    });
    return unsub;
  }, [onReconnect, loadClasses]);

  // Load specific tab data when detail modal opens or tab switches
  const loadTabContent = useCallback(async (tabName, classId) => {
    if (!classId) return;
    setTabLoading(true);
    try {
      if (tabName === 'students') {
        const students = await teacherClassService.getStudents(classId);
        setTabData((prev) => ({ ...prev, students: Array.isArray(students) ? students : [] }));
      } else if (tabName === 'sessions') {
        const sessions = await teacherClassService.getSessions(classId);
        setTabData((prev) => ({ ...prev, sessions: Array.isArray(sessions) ? sessions : [] }));
      } else if (tabName === 'materials') {
        const materials = await teacherClassService.getMaterials(classId);
        setTabData((prev) => ({ ...prev, materials: Array.isArray(materials) ? materials : [] }));
      } else if (tabName === 'attendance') {
        const attendance = await teacherClassService.getAttendance(classId);
        setTabData((prev) => ({ ...prev, attendance: Array.isArray(attendance) ? attendance : [] }));
      }
    } catch (err) {
      console.warn(`Failed loading ${tabName} for class ${classId}:`, err);
    } finally {
      setTabLoading(false);
    }
  }, []);

  const handleOpenDetail = (cls) => {
    setSelectedClass(cls);
    setActiveTab('overview');
    setModalMode('detail');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (selectedClass && tab !== 'overview') {
      loadTabContent(tab, selectedClass.id);
    }
  };

  const handleOpenCreate = () => {
    const defaultProg = programs.length > 0 ? programs[0] : null;
    setFormData({
      className: '',
      programId: defaultProg ? defaultProg.id : '',
      level: 'N5 Beginner',
      schedule: 'Senin - Kamis, 08.30 - 12.00 WIB',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      capacity: 20,
      location: 'Ruang Teori 1 (Lt. 2)',
      status: 'OPEN',
      description: ''
    });
    setSelectedClass(null);
    setModalMode('create');
  };

  const handleOpenEdit = (cls) => {
    setSelectedClass(cls);
    setFormData({
      className: cls.name || cls.className || cls.class_name || '',
      programId: cls.programId || cls.program_id || (programs.find((p) => p.title === cls.program?.title)?.id ?? ''),
      level: cls.level || 'N5 Beginner',
      schedule: cls.schedule || '',
      startDate: cls.startDate || cls.start_date || '',
      endDate: cls.endDate || cls.end_date || '',
      capacity: cls.capacity || 20,
      location: cls.location || '',
      status: cls.status || 'OPEN',
      description: cls.description || ''
    });
    setModalMode('edit');
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);
    try {
      if (modalMode === 'create') {
        const created = await teacherClassService.create(formData);
        setFeedback({ type: 'success', message: 'Kelas bimbingan baru berhasil dibuat.' });
        if (created) {
          setClasses((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
        }
      } else if (modalMode === 'edit' && selectedClass) {
        const updated = await teacherClassService.update(selectedClass.id, formData);
        setFeedback({ type: 'success', message: 'Data kelas bimbingan berhasil diperbarui.' });
        if (updated) {
          setClasses((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
        }
      }
      setModalMode(null);
      loadClasses();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menyimpan data kelas.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      setActionLoading(true);
      setFeedback(null);
      try {
        await teacherClassService.delete(deleteTarget.id);
        setFeedback({ type: 'success', message: `Kelas '${deleteTarget.name || deleteTarget.className || deleteTarget.class_name}' berhasil dihapus.` });
        setDeleteTarget(null);
        setClasses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Gagal menghapus kelas.';
        setFeedback({ type: 'error', message: msg });
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Quick Action: Add session for selected class
  const handleOpenAddSession = () => {
    setSessionFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      start_time: '08:30',
      end_time: '11:30',
      location: selectedClass?.location || 'Ruang Teori 1',
      status: 'SCHEDULED',
      notes: ''
    });
    setShowAddSessionModal(true);
  };

  const handleSaveSession = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;
    setActionLoading(true);
    try {
      const payload = {
        ...sessionFormData,
        class_id: selectedClass.id
      };
      const res = await teacherClassService.createSession(payload);
      setFeedback({ type: 'success', message: 'Sesi jadwal baru berhasil ditambahkan.' });
      setShowAddSessionModal(false);
      if (res) {
        setTabData((prev) => ({
          ...prev,
          sessions: [res, ...prev.sessions]
        }));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menambahkan sesi jadwal.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Kelas Bimbingan Saya
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Daftar rombongan belajar dan kelas program yang Anda ampu sebagai Sensei.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1rem', fontWeight: 700 }}
        >
          <Plus size={16} />
          <span>Tambah Kelas</span>
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            color: feedback.type === 'error' ? '#EF4444' : '#10B981',
            border: `1px solid ${feedback.type === 'error' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{feedback.message}</span>
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

      {loading ? (
        <div className="student-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Memuat daftar kelas bimbingan...</p>
        </div>
      ) : error ? (
        <div className="student-card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--vermilion)' }}>
          <p>{error}</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="student-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <GraduationCap size={42} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Belum Ada Kelas Bimbingan
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Anda belum memiliki kelas aktif. Klik tombol <strong>Tambah Kelas</strong> di atas untuk membuat kelas bimbingan baru.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.25rem' }}>
          {classes.map((cls) => {
            const className = cls.name || cls.class_name || cls.className;
            const programTitle = cls.program?.title || cls.programTitle || 'Program Pelatihan';
            const studentsCount = cls.currentStudents ?? cls.current_students ?? cls.students_count ?? cls.studentsCount ?? 0;
            const capacity = cls.capacity || 20;

            return (
              <div
                key={cls.id}
                className="student-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  borderLeft: '4px solid var(--vermilion)',
                  backgroundColor: 'var(--surface)',
                  gap: '1.25rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--surface-muted)',
                        color: 'var(--vermilion)'
                      }}
                    >
                      {programTitle}
                    </span>
                    <StatusBadge status={cls.status || 'OPEN'} />
                  </div>

                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      margin: '0 0 0.5rem 0',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleOpenDetail(cls)}
                    title="Klik untuk melihat detail kelas"
                  >
                    {className}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {cls.schedule && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={14} style={{ color: 'var(--vermilion)' }} />
                        <span>{cls.schedule}</span>
                      </div>
                    )}
                    {cls.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={14} style={{ color: 'var(--vermilion)' }} />
                        <span>{cls.location}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={14} style={{ color: 'var(--vermilion)' }} />
                      <span>
                        <strong>{studentsCount}</strong> / {capacity} Siswa Terdaftar
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions: Detail button + Edit & Direct links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(cls)}
                      className="btn btn-outline btn-sm"
                      style={{ flex: 1, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
                    >
                      <Info size={14} />
                      <span>Detail Kelas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cls)}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', padding: '0.4rem 0.6rem' }}
                      title="Edit Pengaturan Kelas"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cls)}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', padding: '0.4rem 0.6rem', color: '#EF4444' }}
                      title="Hapus Kelas"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Direct Module Links */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                    <Link
                      to="/teacher/schedule"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.2rem',
                        textDecoration: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--surface-muted)',
                        padding: '0.4rem 0.2rem',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center'
                      }}
                    >
                      <Calendar size={14} style={{ color: 'var(--vermilion)' }} />
                      <span>Jadwal</span>
                    </Link>

                    <Link
                      to="/teacher/attendance"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.2rem',
                        textDecoration: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--surface-muted)',
                        padding: '0.4rem 0.2rem',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center'
                      }}
                    >
                      <ClipboardCheck size={14} style={{ color: 'var(--emerald)' }} />
                      <span>Presensi</span>
                    </Link>

                    <Link
                      to="/teacher/materials"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.2rem',
                        textDecoration: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--surface-muted)',
                        padding: '0.4rem 0.2rem',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center'
                      }}
                    >
                      <BookOpen size={14} style={{ color: '#2563EB' }} />
                      <span>Materi</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create / Edit Class */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Tambah Kelas Bimbingan Baru' : 'Edit Kelas Bimbingan'}
        maxWidth="680px"
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="teacher-class-form" disabled={actionLoading} className="btn btn-primary btn-sm">
              {actionLoading ? 'Menyimpan...' : 'Simpan Kelas'}
            </button>
          </>
        }
      >
        <form id="teacher-class-form" onSubmit={handleSaveClass}>
          <FormField
            label="Nama Kelas / Rombel"
            required
            value={formData.className}
            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
            placeholder="Contoh: Kelas Persiapan Tokutei Ginou Kaigo Batch 04"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Induk Program (Dari Admin)"
              type="select"
              required
              value={formData.programId}
              onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
              options={[
                { value: '', label: '-- Pilih Program Pelatihan --' },
                ...programs.map((p) => ({ value: p.id, label: p.title }))
              ]}
            />
            <FormField
              label="Tingkat / Level"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              placeholder="Contoh: N4 Intermediate"
            />
          </div>

          <FormField
            label="Jadwal Pembelajaran"
            required
            value={formData.schedule}
            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
            placeholder="Contoh: Senin - Kamis, 08.30 - 12.00 WITA"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Tanggal Mulai"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <FormField
              label="Tanggal Selesai"
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Kapasitas Maksimal Siswa"
              type="number"
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            />
            <FormField
              label="Status Kelas"
              type="select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'OPEN', label: 'Open (Pendaftaran Dibuka)' },
                { value: 'UPCOMING', label: 'Upcoming (Akan Datang)' },
                { value: 'ONGOING', label: 'Ongoing (Sedang Berjalan)' },
                { value: 'FULL', label: 'Full (Kuota Penuh)' },
                { value: 'COMPLETED', label: 'Completed (Selesai)' }
              ]}
            />
          </div>

          <FormField
            label="Lokasi Ruangan"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Contoh: Ruang Teori 1 (Lt. 2)"
          />

          <FormField
            label="Keterangan / Target Pembelajaran (Opsional)"
            type="textarea"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Catatan target materi, silabus, persyaratan kelas..."
          />
        </form>
      </Modal>

      {/* DETAIL MODAL (5 TABS: Overview, Siswa, Sesi Mengajar, Materi, Absensi) */}
      <Modal
        isOpen={modalMode === 'detail' && !!selectedClass}
        onClose={() => setModalMode(null)}
        title={`Detail: ${selectedClass?.name || selectedClass?.class_name || selectedClass?.className || 'Kelas'}`}
        maxWidth="820px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Tutup
            </button>
            <button
              type="button"
              onClick={() => handleOpenEdit(selectedClass)}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Edit2 size={14} />
              <span>Edit Informasi Kelas</span>
            </button>
          </div>
        }
      >
        {selectedClass && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Tab Navigation */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--border-subtle)',
                gap: '0.5rem',
                overflowX: 'auto',
                paddingBottom: '0.25rem'
              }}
            >
              {[
                { id: 'overview', label: 'Overview', icon: Info },
                { id: 'students', label: 'Siswa', icon: Users },
                { id: 'sessions', label: 'Sesi Mengajar', icon: Calendar },
                { id: 'materials', label: 'Materi', icon: BookOpen },
                { id: 'attendance', label: 'Absensi', icon: ClipboardCheck }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 0.85rem',
                      fontSize: '0.82rem',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? 'var(--vermilion)' : 'var(--text-secondary)',
                      borderBottom: isActive ? '2px solid var(--vermilion)' : '2px solid transparent',
                      background: 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <IconComponent size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>PROGRAM PELATIHAN</div>
                    <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{selectedClass.program?.title || selectedClass.programTitle || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>TINGKAT / LEVEL</div>
                    <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{selectedClass.level || 'Standard'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>STATUS KELAS</div>
                    <div style={{ marginTop: '0.2rem' }}>
                      <StatusBadge status={selectedClass.status || 'OPEN'} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>JADWAL PEMBELAJARAN</div>
                    <div style={{ marginTop: '0.2rem' }}>{selectedClass.schedule || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>LOKASI RUANGAN</div>
                    <div style={{ marginTop: '0.2rem' }}>{selectedClass.location || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>KAPASITAS KELAS</div>
                    <div style={{ marginTop: '0.2rem' }}>
                      <strong>{selectedClass.currentStudents ?? selectedClass.current_students ?? 0}</strong> / {selectedClass.capacity || 20} Siswa
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>PERIODE BELAJAR</div>
                  <div style={{ marginTop: '0.2rem' }}>
                    {selectedClass.startDate || selectedClass.start_date || '-'} s.d {selectedClass.endDate || selectedClass.end_date || '-'}
                  </div>
                </div>

                {selectedClass.description && (
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>KETERANGAN / DESKRIPSI</div>
                    <div style={{ marginTop: '0.2rem', color: '#334155', lineHeight: 1.5 }}>
                      {selectedClass.description}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB SISWA */}
            {activeTab === 'students' && (
              <div>
                {tabLoading ? (
                  <p style={{ textAlign: 'center', color: '#64748B', padding: '2rem 0' }}>Memuat data siswa terdaftar...</p>
                ) : tabData.students.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748B' }}>
                    <Users size={36} style={{ color: '#94A3B8', marginBottom: '0.5rem' }} />
                    <p style={{ fontWeight: 600, margin: 0 }}>Belum Ada Siswa Terdaftar</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Siswa akan otomatis muncul setelah Administrator menyetujui enrollment pada kelas ini.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: '#64748B' }}>
                          <th style={{ padding: '0.5rem' }}>No</th>
                          <th style={{ padding: '0.5rem' }}>Nama Siswa</th>
                          <th style={{ padding: '0.5rem' }}>Email / Kontak</th>
                          <th style={{ padding: '0.5rem' }}>Asal Kota</th>
                          <th style={{ padding: '0.5rem' }}>Level Bahasa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tabData.students.map((student, idx) => (
                          <tr key={student.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '0.5rem' }}>{idx + 1}</td>
                            <td style={{ padding: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{student.name}</td>
                            <td style={{ padding: '0.5rem' }}>
                              <div>{student.email}</div>
                              {student.phone && <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{student.phone}</div>}
                            </td>
                            <td style={{ padding: '0.5rem' }}>{student.city || '-'}</td>
                            <td style={{ padding: '0.5rem' }}>{student.japaneseLevel || 'N5'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB SESI MENGAJAR */}
            {activeTab === 'sessions' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
                    Total: {tabData.sessions.length} Sesi Pertemuan Terjadwal
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddSession}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
                  >
                    <Plus size={14} />
                    <span>Tambah Sesi</span>
                  </button>
                </div>

                {tabLoading ? (
                  <p style={{ textAlign: 'center', color: '#64748B', padding: '2rem 0' }}>Memuat sesi mengajar...</p>
                ) : tabData.sessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748B' }}>
                    <Calendar size={36} style={{ color: '#94A3B8', marginBottom: '0.5rem' }} />
                    <p style={{ fontWeight: 600, margin: 0 }}>Belum Ada Sesi Pertemuan Terjadwal</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Gunakan tombol <strong>Tambah Sesi</strong> untuk membuat jadwal pertemuan kelas ini.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {tabData.sessions.map((sess) => (
                      <div
                        key={sess.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--surface-muted)',
                          borderLeft: '3px solid var(--vermilion)'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{sess.title}</div>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#64748B', marginTop: '0.25rem' }}>
                            <span>📅 {sess.date}</span>
                            <span>⏰ {sess.startTime} - {sess.endTime}</span>
                            <span>📍 {sess.location}</span>
                          </div>
                          {sess.notes && (
                            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.25rem', fontStyle: 'italic' }}>
                              Catatan: {sess.notes}
                            </div>
                          )}
                        </div>
                        <StatusBadge status={sess.status || 'SCHEDULED'} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB MATERI */}
            {activeTab === 'materials' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
                    Materi Terkait Kelas ({tabData.materials.length})
                  </div>
                  <Link
                    to="/teacher/materials"
                    className="btn btn-outline btn-sm"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
                  >
                    <span>Kelola Materi Lengkap</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {tabLoading ? (
                  <p style={{ textAlign: 'center', color: '#64748B', padding: '2rem 0' }}>Memuat materi...</p>
                ) : tabData.materials.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748B' }}>
                    <BookOpen size={36} style={{ color: '#94A3B8', marginBottom: '0.5rem' }} />
                    <p style={{ fontWeight: 600, margin: 0 }}>Belum Ada Materi Diunggah</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Buka menu Materi Pengajar untuk mengunggah modul, dokumen, atau tautan video ke kelas ini.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {tabData.materials.map((mat) => (
                      <div
                        key={mat.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--surface-muted)'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{mat.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                            Tipe: {mat.type || 'DOCUMENT'} | {mat.isPublished ? 'Dipublikasikan' : 'Draft'}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: mat.isPublished ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                            color: mat.isPublished ? '#10B981' : '#64748B'
                          }}
                        >
                          {mat.isPublished ? 'TERBIT' : 'DRAFT'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB ABSENSI */}
            {activeTab === 'attendance' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
                    Catatan Presensi ({tabData.attendance.length})
                  </div>
                  <Link
                    to="/teacher/attendance"
                    className="btn btn-outline btn-sm"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
                  >
                    <span>Buka Lembar Presensi</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {tabLoading ? (
                  <p style={{ textAlign: 'center', color: '#64748B', padding: '2rem 0' }}>Memuat presensi...</p>
                ) : tabData.attendance.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748B' }}>
                    <ClipboardCheck size={36} style={{ color: '#94A3B8', marginBottom: '0.5rem' }} />
                    <p style={{ fontWeight: 600, margin: 0 }}>Belum Ada Catatan Presensi</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Buka menu Presensi Pengajar untuk mencatat kehadiran siswa pada kelas ini.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: '#64748B' }}>
                          <th style={{ padding: '0.5rem' }}>Tanggal</th>
                          <th style={{ padding: '0.5rem' }}>Nama Siswa</th>
                          <th style={{ padding: '0.5rem' }}>Status</th>
                          <th style={{ padding: '0.5rem' }}>Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tabData.attendance.map((att) => (
                          <tr key={att.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '0.5rem' }}>{att.attendanceDate || '-'}</td>
                            <td style={{ padding: '0.5rem', fontWeight: 700 }}>{att.userName || '-'}</td>
                            <td style={{ padding: '0.5rem' }}>
                              <StatusBadge status={att.status || 'HADIR'} />
                            </td>
                            <td style={{ padding: '0.5rem', color: '#64748B' }}>{att.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* QUICK ACTION MODAL: Add Teaching Session */}
      <Modal
        isOpen={showAddSessionModal}
        onClose={() => setShowAddSessionModal(false)}
        title={`Tambah Sesi: ${selectedClass?.name || selectedClass?.class_name || 'Kelas'}`}
        maxWidth="580px"
        footer={
          <>
            <button type="button" onClick={() => setShowAddSessionModal(false)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="add-session-form" disabled={actionLoading} className="btn btn-primary btn-sm">
              {actionLoading ? 'Menyimpan...' : 'Simpan Sesi'}
            </button>
          </>
        }
      >
        <form id="add-session-form" onSubmit={handleSaveSession}>
          <FormField
            label="Judul Sesi / Materi Pertemuan"
            required
            value={sessionFormData.title}
            onChange={(e) => setSessionFormData({ ...sessionFormData, title: e.target.value })}
            placeholder="Contoh: Pertemuan 01: Pola Kalimat Bunpou N5 & Kaiwa"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Tanggal Pertemuan"
              type="date"
              required
              value={sessionFormData.date}
              onChange={(e) => setSessionFormData({ ...sessionFormData, date: e.target.value })}
            />
            <FormField
              label="Status Sesi"
              type="select"
              value={sessionFormData.status}
              onChange={(e) => setSessionFormData({ ...sessionFormData, status: e.target.value })}
              options={[
                { value: 'SCHEDULED', label: 'Dijadwalkan (Scheduled)' },
                { value: 'COMPLETED', label: 'Selesai (Completed)' },
                { value: 'CANCELLED', label: 'Dibatalkan (Cancelled)' }
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Jam Mulai"
              type="time"
              required
              value={sessionFormData.start_time}
              onChange={(e) => setSessionFormData({ ...sessionFormData, start_time: e.target.value })}
            />
            <FormField
              label="Jam Selesai"
              type="time"
              required
              value={sessionFormData.end_time}
              onChange={(e) => setSessionFormData({ ...sessionFormData, end_time: e.target.value })}
            />
          </div>

          <FormField
            label="Lokasi Ruangan"
            value={sessionFormData.location}
            onChange={(e) => setSessionFormData({ ...sessionFormData, location: e.target.value })}
            placeholder="Contoh: Ruang Teori 1 (Lt. 2)"
          />

          <FormField
            label="Catatan / Target Sesi (Opsional)"
            type="textarea"
            rows={2}
            value={sessionFormData.notes}
            onChange={(e) => setSessionFormData({ ...sessionFormData, notes: e.target.value })}
            placeholder="Contoh: Bawa buku Minna no Nihongo I Bab 1..."
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Kelas Bimbingan"
        message={`Apakah Anda yakin ingin menghapus kelas '${deleteTarget?.name || deleteTarget?.className || deleteTarget?.class_name}'?`}
      />
    </div>
  );
}
