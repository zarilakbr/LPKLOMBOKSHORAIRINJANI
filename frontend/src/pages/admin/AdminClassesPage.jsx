import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Users } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import { adminClassService, programService } from '../../services/dataService';
import { apiClient } from '../../services/apiClient';
import { useRealtimeEvent, useRealtime } from '../../context/RealtimeContext';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const { onReconnect } = useRealtime();

  const [formData, setFormData] = useState({
    className: '',
    programId: '',
    programTitle: 'Bahasa Jepang Dasar (N5)',
    teacherId: '',
    instructor: '',
    level: 'N5 Beginner',
    schedule: 'Senin - Kamis, 08.30 - 12.00 WIB',
    startDate: '',
    endDate: '',
    capacity: 20,
    currentStudents: 0,
    location: 'Ruang Sakura (Lantai 2)',
    status: 'OPEN',
    description: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [classRes, progRes, teacherRes] = await Promise.allSettled([
        adminClassService.getAll(),
        programService.getAll(),
        apiClient.get('/admin/users', { params: { role: 'PENGAJAR', per_page: 100 } })
      ]);

      if (classRes.status === 'fulfilled') {
        setClasses(Array.isArray(classRes.value) ? classRes.value : []);
      }
      if (progRes.status === 'fulfilled') {
        setPrograms(Array.isArray(progRes.value) ? progRes.value : []);
      }
      if (teacherRes.status === 'fulfilled') {
        const fetchedTeachers = teacherRes.value.data?.data || [];
        setTeachers(Array.isArray(fetchedTeachers) ? fetchedTeachers : []);
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
      setFeedback({ type: 'error', message: 'Gagal memuat data kelas pelatihan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Realtime Listeners for Class changes
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
  });

  useRealtimeEvent('class.deleted', (deleted) => {
    const deletedId = deleted?.id ?? deleted;
    setClasses((prev) => prev.filter((c) => c.id !== deletedId));
  });

  useEffect(() => {
    if (!onReconnect) return;
    const unsub = onReconnect(() => {
      loadData();
    });
    return unsub;
  }, [onReconnect]);

  const filtered = (classes || []).filter((c) => {
    const className = String(c?.className ?? '').toLowerCase();
    const instructor = String(c?.instructor ?? '').toLowerCase();
    const programTitle = String(c?.programTitle ?? '').toLowerCase();
    const searchTerm = String(search ?? '').toLowerCase();

    const matchSearch =
      className.includes(searchTerm) ||
      instructor.includes(searchTerm) ||
      programTitle.includes(searchTerm);
    const matchStatus = filterStatus === 'ALL' || c?.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleOpenCreate = () => {
    const defaultProg = programs.length > 0 ? programs[0] : null;
    const defaultTeacher = teachers.length > 0 ? teachers[0] : null;
    setFormData({
      className: '',
      programId: defaultProg ? defaultProg.id : '',
      programTitle: defaultProg ? defaultProg.title : 'Bahasa Jepang Dasar (N5)',
      teacherId: defaultTeacher ? defaultTeacher.id : '',
      instructor: defaultTeacher ? defaultTeacher.name : '',
      level: 'N5 Beginner',
      schedule: 'Senin - Kamis, 08.30 - 12.00 WIB',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      capacity: 20,
      currentStudents: 0,
      location: 'Ruang Sakura (Lantai 2)',
      status: 'OPEN',
      description: ''
    });
    setSelectedItem(null);
    setModalMode('create');
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    const matchedProg = programs.find((p) => p.id === item.programId || p.title === item.programTitle);
    const matchedTeacher = teachers.find((t) => t.id === item.teacherId || t.name === item.instructor);
    setFormData({
      className: item.className || item.class_name || '',
      programId: item.programId || matchedProg?.id || '',
      programTitle: item.programTitle || matchedProg?.title || '',
      teacherId: item.teacherId || item.teacher?.id || matchedTeacher?.id || '',
      instructor: item.teacher?.name || item.instructor || matchedTeacher?.name || '',
      level: item.level || 'N5 Beginner',
      schedule: item.schedule || '',
      startDate: item.startDate || item.start_date || '',
      endDate: item.endDate || item.end_date || '',
      capacity: item.capacity || 20,
      currentStudents: item.currentStudents ?? item.current_students ?? 0,
      location: item.location || '',
      status: item.status || 'OPEN',
      description: item.description || ''
    });
    setModalMode('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);
    try {
      if (modalMode === 'create') {
        await adminClassService.create(formData);
        setFeedback({ type: 'success', message: 'Batch kelas baru berhasil dibuka.' });
      } else if (modalMode === 'edit' && selectedItem) {
        await adminClassService.update(selectedItem.id, formData);
        setFeedback({ type: 'success', message: 'Informasi kelas berhasil diperbarui.' });
      }
      setModalMode(null);
      loadData();
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
        await adminClassService.delete(deleteTarget.id);
        setFeedback({ type: 'success', message: `Kelas '${deleteTarget.className || deleteTarget.class_name}' berhasil dihapus.` });
        setDeleteTarget(null);
        loadData();
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Gagal menghapus kelas.';
        setFeedback({ type: 'error', message: msg });
      } finally {
        setActionLoading(false);
      }
    }
  };

  const columns = [
    {
      header: 'Nama Batch & Kelas',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{row.className || row.class_name}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{row.programTitle || row.program?.title}</div>
        </div>
      )
    },
    {
      header: 'Pengajar (Sensei)',
      render: (row) => {
        const name = row.teacher?.name || row.instructor || '-';
        const email = row.teacher?.email;
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#0F172A' }}>{name}</div>
            {email && <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{email}</div>}
          </div>
        );
      }
    },
    { header: 'Jadwal Hari & Jam', accessor: 'schedule' },
    {
      header: 'Kapasitas Siswa',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700 }}>{row.currentStudents ?? row.current_students ?? 0}</span> / {row.capacity} Siswa
        </div>
      )
    },
    { header: 'Lokasi Ruangan', accessor: 'location' },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div>
      {feedback && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
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
      <DataTable
        columns={columns}
        data={filtered}
        totalItems={filtered.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama batch / instruktur..."
        filterValue={filterStatus}
        onFilterChange={setFilterStatus}
        filterOptions={[
          { value: 'ALL', label: 'Semua Status' },
          { value: 'OPEN', label: 'Pendaftaran Dibuka' },
          { value: 'FULL', label: 'Kuota Penuh' },
          { value: 'UPCOMING', label: 'Akan Datang' },
          { value: 'ONGOING', label: 'Sedang Berjalan' },
          { value: 'COMPLETED', label: 'Selesai' }
        ]}
        onAddNew={handleOpenCreate}
        addNewLabel="Buka Batch Baru"
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
        title={modalMode === 'create' ? 'Buka Batch Angkatan Baru' : 'Edit Jadwal Kelas'}
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="class-form" disabled={actionLoading} className="btn btn-primary btn-sm">
              {actionLoading ? 'Menyimpan...' : 'Simpan Batch'}
            </button>
          </>
        }
      >
        <form id="class-form" onSubmit={handleSave}>
          <FormField
            label="Nama Batch Kelas"
            required
            value={formData.className}
            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
            placeholder="Contoh: Batch 50 - Dasar N5 Pagi"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Induk Program"
              type="select"
              required
              value={formData.programId}
              onChange={(e) => {
                const pid = e.target.value;
                const prog = programs.find((p) => String(p.id) === String(pid));
                setFormData({
                  ...formData,
                  programId: pid,
                  programTitle: prog ? prog.title : formData.programTitle
                });
              }}
              options={[
                { value: '', label: '-- Pilih Program Pelatihan --' },
                ...programs.map((p) => ({ value: p.id, label: p.title }))
              ]}
            />
            <FormField
              label="Pengajar (Sensei)"
              type="select"
              value={formData.teacherId}
              onChange={(e) => {
                const tid = e.target.value;
                const tch = teachers.find((t) => String(t.id) === String(tid));
                setFormData({
                  ...formData,
                  teacherId: tid,
                  instructor: tch ? tch.name : ''
                });
              }}
              options={[
                { value: '', label: '-- Belum Ditugaskan / Pilih Pengajar --' },
                ...teachers.map((t) => ({ value: t.id, label: `${t.name} (${t.email})` }))
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Tanggal Mulai"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <FormField
              label="Tanggal Selesai"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Kapasitas Maksimal"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            />
            <FormField
              label="Siswa Terdaftar Saat Ini"
              type="number"
              value={formData.currentStudents}
              onChange={(e) => setFormData({ ...formData, currentStudents: Number(e.target.value) })}
            />
          </div>

          <FormField
            label="Jadwal Pembelajaran"
            value={formData.schedule}
            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
            placeholder="Contoh: Senin - Kamis, 08.30 - 12.00 WIB"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Lokasi Ruangan"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <FormField
              label="Status Batch"
              type="select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'OPEN', label: 'Open (Pendaftaran Dibuka)' },
                { value: 'FULL', label: 'Full (Kuota Penuh)' },
                { value: 'UPCOMING', label: 'Upcoming (Akan Datang)' },
                { value: 'ONGOING', label: 'Ongoing (Sedang Berjalan)' },
                { value: 'COMPLETED', label: 'Completed (Selesai)' }
              ]}
            />
          </div>

          <FormField
            label="Keterangan / Deskripsi Kelas (Opsional)"
            type="textarea"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Catatan tambahan mengenai silabus, target kelulusan, dsb..."
          />
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={modalMode === 'view'}
        onClose={() => setModalMode(null)}
        title="Detail Kelas & Angkatan"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Tutup
            </button>
            {selectedItem && (
              <Link
                to={`/admin/enrollments?class_id=${selectedItem.id}`}
                className="btn btn-primary btn-sm"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Users size={14} />
                <span>Kelola Peserta Kelas</span>
              </Link>
            )}
          </div>
        }
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>NAMA BATCH</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedItem.className || selectedItem.class_name}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>PROGRAM</div>
                <div>{selectedItem.programTitle || selectedItem.program?.title}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>PENGAJAR (SENSEI)</div>
                <div style={{ fontWeight: 600 }}>{selectedItem.teacher?.name || selectedItem.instructor || '-'}</div>
                {selectedItem.teacher?.email && (
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{selectedItem.teacher.email}</div>
                )}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>PERIODE BELAJAR</div>
              <div>{selectedItem.startDate || selectedItem.start_date} s.d {selectedItem.endDate || selectedItem.end_date}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>KAPASITAS & RUANGAN</div>
              <div>{selectedItem.currentStudents ?? selectedItem.current_students ?? 0} dari {selectedItem.capacity} Kursi ({selectedItem.location})</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>STATUS</div>
              <div style={{ marginTop: '0.25rem' }}>
                <StatusBadge status={selectedItem.status} />
              </div>
            </div>
            {selectedItem.description && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>DESKRIPSI / CATATAN</div>
                <div style={{ marginTop: '0.25rem', color: '#334155' }}>{selectedItem.description}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Batch Kelas"
        message={`Apakah Anda yakin ingin menghapus '${deleteTarget?.className}'?`}
      />
    </div>
  );
}
