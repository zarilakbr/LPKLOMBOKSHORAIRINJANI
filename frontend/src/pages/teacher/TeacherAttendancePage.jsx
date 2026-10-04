import React, { useState, useEffect, useCallback } from 'react';
import {
  ClipboardCheck,
  Calendar,
  Filter,
  CheckCircle2,
  Clock4,
  FileCheck,
  AlertCircle,
  XCircle,
  Save,
  Users,
  X
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useRealtimeEvent, useRealtime } from '../../context/RealtimeContext';

const STATUS_OPTIONS = [
  { value: 'hadir', label: 'Hadir', color: 'var(--emerald)' },
  { value: 'terlambat', label: 'Terlambat', color: 'var(--ochre, #D97706)' },
  { value: 'izin', label: 'Izin', color: 'var(--primary, #2563EB)' },
  { value: 'sakit', label: 'Sakit', color: '#9333EA' },
  { value: 'alpa', label: 'Alpa', color: 'var(--vermilion)' }
];

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendances, setAttendances] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const { onReconnect } = useRealtime();

  // Load teacher classes
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await apiClient.get('/teacher/classes');
        if (res.data?.success && Array.isArray(res.data.data)) {
          const clsList = res.data.data;
          setClasses(clsList);
          if (clsList.length > 0 && !selectedClassId) {
            setSelectedClassId(String(clsList[0].id));
          }
        }
      } catch (err) {
        console.error('Failed to load teacher classes:', err);
        setFeedback({ type: 'error', message: 'Gagal memuat daftar kelas bimbingan.' });
      }
    }
    fetchClasses();
  }, []);

  // Load students & attendance records for selected class & date
  const loadRosterAndAttendance = useCallback(async () => {
    if (!selectedClassId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [stuRes, attRes] = await Promise.allSettled([
        apiClient.get(`/teacher/classes/${selectedClassId}/students`),
        apiClient.get(`/teacher/classes/${selectedClassId}/attendance`, {
          params: { date: selectedDate }
        })
      ]);

      let stuList = [];
      if (stuRes.status === 'fulfilled' && stuRes.value.data?.success) {
        stuList = stuRes.value.data.data || [];
        setStudents(stuList);
      }

      const attMap = {};
      if (attRes.status === 'fulfilled' && attRes.value.data?.success) {
        const attList = attRes.value.data.data || [];
        attList.forEach((att) => {
          const uid = att.userId || att.user_id;
          attMap[uid] = {
            id: att.id,
            status: att.status,
            notes: att.notes || '',
            checkInAt: att.checkInAt || att.check_in_at
          };
        });
      }
      setAttendances(attMap);
    } catch (err) {
      console.error('Failed to load attendance roster:', err);
      setFeedback({ type: 'error', message: 'Gagal memuat data presensi kelas.' });
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedDate]);

  useEffect(() => {
    loadRosterAndAttendance();
  }, [loadRosterAndAttendance]);

  // Re-sync on reconnect
  useEffect(() => {
    return onReconnect(() => {
      loadRosterAndAttendance();
    });
  }, [onReconnect, loadRosterAndAttendance]);

  // REALTIME LISTENERS
  useRealtimeEvent('attendance.recorded', (data) => {
    if (String(data.classId) === String(selectedClassId) && data.attendanceDate === selectedDate) {
      setAttendances((prev) => ({
        ...prev,
        [data.userId]: {
          id: data.id,
          status: data.status,
          notes: data.notes || '',
          checkInAt: data.checkInAt
        }
      }));
    }
  });

  useRealtimeEvent('attendance.updated', (data) => {
    if (String(data.classId) === String(selectedClassId) && data.attendanceDate === selectedDate) {
      setAttendances((prev) => ({
        ...prev,
        [data.userId]: {
          ...prev[data.userId],
          id: data.id,
          status: data.status,
          notes: data.notes || ''
        }
      }));
    }
  });

  // Save student attendance record
  const handleRecordAttendance = async (studentId, status, notes = '') => {
    setSavingId(studentId);
    setFeedback(null);

    try {
      const res = await apiClient.post('/teacher/attendance', {
        class_id: Number(selectedClassId),
        user_id: studentId,
        attendance_date: selectedDate,
        status: status,
        notes: notes
      });

      if (res.data?.success && res.data.data) {
        const item = res.data.data;
        setAttendances((prev) => ({
          ...prev,
          [studentId]: {
            id: item.id,
            status: item.status,
            notes: item.notes || '',
            checkInAt: item.checkInAt
          }
        }));
        setFeedback({
          type: 'success',
          message: `Presensi siswa berhasil dicatat (${status.toUpperCase()}).`
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menyimpan presensi.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSavingId(null);
    }
  };

  // Quick mark all as Hadir
  const handleMarkAllHadir = async () => {
    if (students.length === 0) return;
    setLoading(true);
    let successCount = 0;

    for (const stu of students) {
      try {
        await apiClient.post('/teacher/attendance', {
          class_id: Number(selectedClassId),
          user_id: stu.id,
          attendance_date: selectedDate,
          status: 'hadir',
          notes: 'Presensi serentak oleh sensei.'
        });
        successCount++;
      } catch (err) {
        console.warn(`Failed for student ${stu.id}`, err);
      }
    }

    setFeedback({
      type: 'success',
      message: `Presensi selesai: ${successCount} siswa ditandai HADIR.`
    });
    loadRosterAndAttendance();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Presensi & Absensi Siswa
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Catat dan perbarui status kehadiran harian santri/siswa kelas bimbingan secara realtime.
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllHadir}
          disabled={students.length === 0 || loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1.1rem',
            backgroundColor: 'var(--emerald, #10B981)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: students.length === 0 || loading ? 'not-allowed' : 'pointer',
            opacity: students.length === 0 || loading ? 0.6 : 1
          }}
        >
          <CheckCircle2 size={16} />
          <span>Tandai Semua Hadir</span>
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
                : 'rgba(16, 185, 129, 0.1)',
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
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Control Bar: Class & Date Pickers */}
      <div
        className="student-card"
        style={{
          display: 'flex',
          gap: '1.25rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '1.15rem 1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '240px', flexGrow: 1 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            Pilih Kelas:
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            style={{
              flexGrow: 1,
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name || cls.class_name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            Tanggal Presensi:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          />
        </div>
      </div>

      {/* Student Attendance Table */}
      <div className="student-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Memuat daftar siswa & presensi...</p>
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <Users size={38} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Belum Ada Siswa Terdaftar Aktif
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Kelas ini belum memiliki siswa dengan status enrollment aktif.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>No</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Nama Siswa</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Status Presensi</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Catatan</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu, idx) => {
                  const currentAtt = attendances[stu.id] || null;
                  const currentStatus = (currentAtt?.status || '').toLowerCase();

                  return (
                    <tr
                      key={stu.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-muted)'
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {stu.name}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                        {stu.email}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {STATUS_OPTIONS.map((opt) => {
                            const isSelected = currentStatus === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                disabled={savingId === stu.id}
                                onClick={() => handleRecordAttendance(stu.id, opt.value, currentAtt?.notes || '')}
                                style={{
                                  padding: '0.25rem 0.55rem',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: '0.75rem',
                                  fontWeight: isSelected ? 800 : 500,
                                  border: isSelected ? `2px solid ${opt.color}` : '1px solid var(--border-subtle)',
                                  backgroundColor: isSelected ? opt.color : 'transparent',
                                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <input
                          type="text"
                          defaultValue={currentAtt?.notes || ''}
                          placeholder="Catatan..."
                          onBlur={(e) => {
                            if (currentStatus && e.target.value !== (currentAtt?.notes || '')) {
                              handleRecordAttendance(stu.id, currentStatus, e.target.value);
                            }
                          }}
                          style={{
                            padding: '0.35rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'var(--surface)',
                            color: 'var(--text-primary)',
                            fontSize: '0.8rem',
                            width: '160px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        {savingId === stu.id ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--vermilion)', fontWeight: 600 }}>Menyimpan...</span>
                        ) : currentAtt ? (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: 'var(--emerald)',
                              backgroundColor: 'rgba(16, 185, 129, 0.12)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            Tersimpan
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Belum Diabsen</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
