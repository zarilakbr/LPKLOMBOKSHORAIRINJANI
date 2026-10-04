import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  PhoneCall,
  Sparkles,
  AlertCircle,
  GraduationCap,
  CalendarCheck,
  FileCheck,
  Bell,
  MessageCircle
} from 'lucide-react';
import { studentAuthService } from '../../services/dataService';
import { apiClient } from '../../services/apiClient';
import { useRealtimeEvent, useRealtime } from '../../context/RealtimeContext';
import { BRAND } from '../../config/brand';
import Button from '../../components/common/Button';

export default function StudentDashboardPage() {
  const currentStudent = studentAuthService.getCurrentUser() || {
    id: 101,
    name: 'Siswa LPK',
    email: 'siswa@example.test',
    role: 'SISWA'
  };

  const { onReconnect } = useRealtime();

  const [myRegistrations, setMyRegistrations] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load real student operational data from Laravel REST endpoints
  const loadDashboardData = useCallback(async () => {
    try {
      const [regRes, classRes, attRes, notifRes] = await Promise.allSettled([
        apiClient.get('/student/registrations'),
        apiClient.get('/student/classes'),
        apiClient.get('/student/attendance'),
        apiClient.get('/student/notifications')
      ]);

      if (regRes.status === 'fulfilled' && regRes.value.data?.success) {
        setMyRegistrations(regRes.value.data.data || []);
      }
      if (classRes.status === 'fulfilled' && classRes.value.data?.success) {
        const classes = classRes.value.data.data || [];
        setActiveClass(classes[0] || null);
      }
      if (attRes.status === 'fulfilled' && attRes.value.data?.success) {
        const attendances = attRes.value.data.data || [];
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = attendances.find((a) => (a.attendance_date || a.attendanceDate) === todayStr);
        setTodayAttendance(todayRecord || null);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value.data) {
        setUnreadNotifCount(notifRes.value.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Dashboard API fetch error, fallback to local state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-resync when connection is restored
  useEffect(() => {
    return onReconnect(() => {
      loadDashboardData();
    });
  }, [onReconnect, loadDashboardData]);

  // REALTIME LISTENERS: Zero page reload required!
  // 1. Attendance Recorded/Updated
  useRealtimeEvent('attendance.recorded', (data) => {
    setTodayAttendance({
      status: data.status,
      attendance_date: data.attendanceDate || new Date().toISOString().split('T')[0],
      className: data.className
    });
  });

  useRealtimeEvent('attendance.updated', (data) => {
    setTodayAttendance({
      status: data.status,
      attendance_date: data.attendanceDate || new Date().toISOString().split('T')[0],
      className: data.className
    });
  });

  // 2. Class Enrollment Created/Updated
  useRealtimeEvent('enrollment.created', (data) => {
    setActiveClass({
      id: data.classId,
      name: data.className,
      class_name: data.className,
      status: 'ACTIVE'
    });
  });

  // 3. Schedule Updated
  useRealtimeEvent('schedule.updated', (data) => {
    setActiveClass((prev) => (prev ? { ...prev, schedule: data.schedule, location: data.location } : prev));
  });

  // 4. Notification Created
  useRealtimeEvent('notification.created', () => {
    setUnreadNotifCount((prev) => prev + 1);
  });

  const activeReg = myRegistrations[0] || null;

  return (
    <div>
      {/* Welcome Hero Banner */}
      <div
        className="student-card"
        style={{
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)',
          borderLeft: '4px solid var(--vermilion)',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--vermilion)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            <Sparkles size={14} />
            <span>PORTAL SISWA RESMI</span>
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
            Selamat Datang, {currentStudent.name}!
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '620px' }}>
            Pantau status seleksi berkas, verifikasi dokumen, dan jadwal kelas pelatihan bahasa Jepang Anda di {BRAND.name}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Button to="/dashboard/attendance" variant="primary" size="sm" icon={CalendarCheck}>
            Absen Sekarang
          </Button>
          <Button to="/dashboard/permission" variant="outline" size="sm" icon={FileCheck} style={{ backgroundColor: 'transparent' }}>
            Ajukan Izin
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem'
        }}
      >
        {/* Metric 1: Registration Status */}
        <div className="student-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status Pendaftaran</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {activeReg ? (activeReg.status || 'TERVERIFIKASI').toUpperCase() : 'TERDAFTAR'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Kode: {activeReg?.registration_code || activeReg?.registrationCode || 'REG-AKTIF'}
          </div>
        </div>

        {/* Metric 2: Today's Attendance (LIVE) */}
        <div className="student-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Absensi Hari Ini</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: todayAttendance ? 'var(--emerald-subtle)' : 'rgba(239, 68, 68, 0.1)', color: todayAttendance ? 'var(--emerald)' : 'var(--vermilion)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarCheck size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: todayAttendance ? 'var(--emerald)' : 'var(--text-primary)' }}>
            {todayAttendance ? (todayAttendance.status || 'HADIR').toUpperCase() : 'Belum Absen'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            {todayAttendance ? (
              <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>Tercatat di sistem &bull; Live</span>
            ) : (
              <Link to="/dashboard/attendance" style={{ color: 'var(--vermilion)', textDecoration: 'none', fontWeight: 600 }}>Absen sekarang &rarr;</Link>
            )}
          </div>
        </div>

        {/* Metric 3: Active Class & Schedule */}
        <div className="student-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Kelas Aktif</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--ochre-subtle)', color: 'var(--ochre)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeClass?.class_name || activeClass?.name || 'Bahasa Jepang N5'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            {activeClass?.schedule || 'Senin - Jumat, 08:00 WITA'}
          </div>
        </div>

        {/* Metric 4: Realtime Notifications */}
        <div className="student-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pemberitahuan</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: unreadNotifCount > 0 ? 'var(--vermilion-subtle)' : 'var(--bg-surface-subtle)', color: unreadNotifCount > 0 ? 'var(--vermilion)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {unreadNotifCount} Baru
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            <Link to="/dashboard/notifications" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Lihat semua &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Detail Timeline & WhatsApp Counselor */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
        {/* Registration Detail Card */}
        <div className="student-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Alur Seleksi & Kelulusan Anda
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <CheckCircle2 size={20} color="var(--emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  1. Akun Siswa Dibuat
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Akun Anda telah aktif dan terdaftar di database sistem.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <CheckCircle2 size={20} color="var(--emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  2. Verifikasi Berkas & Enrollment Kelas
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {activeClass ? `Teralokasi ke kelas: ${activeClass.class_name || activeClass.name}` : 'Penempatan kelas pelatihan sedang diproses Admin.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', opacity: activeClass ? 1 : 0.6 }}>
              <Clock size={20} color={activeClass ? 'var(--vermilion)' : 'var(--text-muted)'} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  3. Pelatihan Intensif & Evaluasi
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Bimbingan materi bahasa Jepang dan persiapan kerja Jepang.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Counselor Contact Card */}
        <div className="student-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Bantuan & Konseling Siswa
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Memerlukan bantuan pengisian dokumen atau informasi jadwal ujian? Konselor siswa kami siap membantu Anda.
          </p>

          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-muted)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <PhoneCall size={20} color="var(--emerald)" />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Hotline Konsultasi Siswa:
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {BRAND.phone || 'Layanan Administrasi Lembaga'} (Senin - Sabtu: 08.00 - 17.00 WITA)
              </div>
            </div>
          </div>

          <Button
            to={BRAND.whatsappUrl ? undefined : "/contact"}
            href={BRAND.whatsappUrl || undefined}
            variant="primary"
            size="md"
            icon={MessageCircle}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {BRAND.whatsappUrl ? 'Konsultasi via WhatsApp' : 'Hubungi Layanan Siswa'}
          </Button>
        </div>
      </div>
    </div>
  );
}
