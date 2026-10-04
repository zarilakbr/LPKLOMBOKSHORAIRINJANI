import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  Users,
  BookOpen,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Megaphone,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { authService } from '../../services/dataService';
import { apiClient } from '../../services/apiClient';
import { useRealtimeEvent, useRealtime } from '../../context/RealtimeContext';
import { BRAND } from '../../config/brand';
import Button from '../../components/common/Button';

export default function TeacherDashboardPage() {
  const currentTeacher = authService.getCurrentUser() || {
    name: 'Sensei Kenjiro Tanaka, M.Ed.',
    role: 'PENGAJAR'
  };

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [pendingPermissions, setPendingPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realtimeAlert, setRealtimeAlert] = useState(null);

  const { onReconnect } = useRealtime();

  const loadTeacherData = useCallback(async () => {
    try {
      const [classRes, studentRes, permRes] = await Promise.allSettled([
        apiClient.get('/teacher/classes'),
        apiClient.get('/teacher/students'),
        apiClient.get('/teacher/permissions')
      ]);

      if (classRes.status === 'fulfilled' && classRes.value.data?.success) {
        setClasses(classRes.value.data.data || []);
      }
      if (studentRes.status === 'fulfilled' && studentRes.value.data?.success) {
        setStudents(studentRes.value.data.data || []);
      }
      if (permRes.status === 'fulfilled' && permRes.value.data?.success) {
        const allPerms = permRes.value.data.data || [];
        setPendingPermissions(allPerms.filter((p) => p.status === 'pending' || p.status === 'PENDING'));
      }
    } catch (err) {
      console.warn('Teacher API fetch error, fallback to initial state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeacherData();
  }, [loadTeacherData]);

  // Auto-resync when connection is restored
  useEffect(() => {
    return onReconnect(() => {
      loadTeacherData();
    });
  }, [onReconnect, loadTeacherData]);

  // REALTIME EVENT LISTENERS (Teacher Portal)
  // 1. Siswa mengajukan izin: Pengajar menerima notifikasi realtime dan daftar pending izin bertambah
  useRealtimeEvent('permission.created', (data) => {
    setPendingPermissions((prev) => [data, ...prev.filter((p) => p.id !== data.id)]);
    setRealtimeAlert({
      type: 'permission',
      message: `🔔 Permohonan izin baru dari ${data.studentName || 'Siswa'} (${data.type || 'izin'}) masuk untuk kelas ${data.className || ''}.`
    });
  });

  // 2. Presensi dicatat
  useRealtimeEvent('attendance.recorded', (data) => {
    setRealtimeAlert({
      type: 'attendance',
      message: `Presensi kehadiran siswa dicatat: ${data.userName || 'Siswa'} (${(data.status || '').toUpperCase()}).`
    });
  });

  // 3. Siswa baru dienroll ke kelas teacher
  useRealtimeEvent('enrollment.created', (data) => {
    setStudents((prev) => {
      const newStudent = {
        id: data.studentId,
        name: data.studentName,
        className: data.className,
        status: 'Aktif'
      };
      return [newStudent, ...prev.filter((s) => s.id !== data.studentId)];
    });
    setRealtimeAlert({
      type: 'enrollment',
      message: `Siswa baru dialokasikan ke kelas ${data.className}: ${data.studentName}.`
    });
  });

  const totalStudents = students.length > 0 ? students.length : classes.reduce((sum, cls) => sum + (cls.current_students || cls.enrolledCount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. WELCOME GREETING BANNER */}
      <div
        className="student-card"
        style={{
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)',
          borderLeft: '4px solid var(--ochre, #B45309)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--ochre, #B45309)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            <Sparkles size={14} />
            <span>PORTAL AKADEMIK PENGAJAR (SENSEI)</span>
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
            Selamat Datang, {currentTeacher.name}!
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '640px' }}>
            Kelola jadwal kelas harian, presensi kehadiran siswa binaan, dan modul kurikulum bahasa Jepang di {BRAND.name}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Button to="/teacher/schedule" variant="primary" size="sm" icon={Calendar}>
            Jadwal Mengajar
          </Button>
          <Button to="/teacher/attendance" variant="outline" size="sm" icon={ClipboardCheck} style={{ backgroundColor: 'transparent' }}>
            Presensi Siswa
          </Button>
        </div>
      </div>

      {/* Realtime Alert Banner */}
      {realtimeAlert && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--ochre-subtle)',
            border: '1px solid var(--ochre-border)',
            color: 'var(--ochre, #B45309)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.86rem',
            fontWeight: 700
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={16} />
            <span>{realtimeAlert.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setRealtimeAlert(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 800 }}
          >
            &times;
          </button>
        </div>
      )}

      {/* 2. RINGKASAN KELAS (METRICS) */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Ringkasan Kelas & Pembelajaran
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: '1.25rem'
          }}
        >
          <div className="student-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Kelas Binaan Aktif</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--ochre-subtle)', color: 'var(--ochre, #B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={17} />
              </div>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {classes.length} Angkatan
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Kelas dalam binaan aktif Anda
            </div>
          </div>

          <div className="student-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Siswa Binaan</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={17} />
              </div>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {totalStudents} Siswa
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--emerald)', marginTop: '0.35rem', fontWeight: 600 }}>
              Terdaftar di enrollment aktif
            </div>
          </div>

          <div className="student-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Permohonan Izin Pending</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: pendingPermissions.length > 0 ? 'var(--vermilion-subtle)' : 'var(--emerald-subtle)', color: pendingPermissions.length > 0 ? 'var(--vermilion)' : 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileCheck size={17} />
              </div>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {pendingPermissions.length} Izin
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {pendingPermissions.length > 0 ? (
                <Link to="/teacher/permissions" style={{ color: 'var(--vermilion)', fontWeight: 700, textDecoration: 'none' }}>Review sekarang &rarr;</Link>
              ) : 'Semua izin telah ditinjau'}
            </div>
          </div>

          <div className="student-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Materi Pelatihan</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--surface-muted)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={17} />
              </div>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Kurikulum N5 - N4
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Standar JLPT & Tokutei Ginou
            </div>
          </div>
        </div>
      </div>

      {/* 3. DAFTAR KELAS AKTIF YANG DIAMPU */}
      <div className="student-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Daftar Kelas Aktif yang Diampu
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Jadwal mingguan dan alokasi kapasitas ruang belajar
            </p>
          </div>
          <Link to="/teacher/classes" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ochre, #B45309)', textDecoration: 'none' }}>
            Lihat Semua Kelas &rarr;
          </Link>
        </div>

        {classes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Belum ada kelas yang ditugaskan ke akun Pengajar Anda.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
            {classes.map((cls) => (
              <div
                key={cls.id}
                style={{
                  padding: '1.1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface-muted)'
                }}
              >
                <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                  {cls.class_name || cls.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {cls.schedule || 'Jadwal Intensif'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                  <span>Ruang: {cls.location || 'Ruang Sakura'}</span>
                  <span style={{ fontWeight: 700, color: 'var(--emerald)' }}>
                    {cls.current_students || cls.enrolledCount || 0} Siswa Enrolled
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. DAFTAR SISWA BINAAN AKTIF */}
      <div className="student-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Daftar Siswa Binaan
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Siswa aktif yang terdaftar dalam kelas binaan Anda
            </p>
          </div>
          <Link to="/teacher/students" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ochre, #B45309)', textDecoration: 'none' }}>
            Buka Daftar Lengkap &rarr;
          </Link>
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-muted)' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Nama Siswa</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Kelas Angkatan</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.78rem', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Belum ada data siswa terdaftar di kelas binaan Anda.
                  </td>
                </tr>
              ) : (
                students.slice(0, 6).map((st) => (
                  <tr key={st.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {st.name || st.studentName}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                      {st.className || st.class_name || 'Kelas Terdaftar'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          backgroundColor: 'var(--emerald-subtle)',
                          color: 'var(--emerald)'
                        }}
                      >
                        Aktif Enrolled
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
