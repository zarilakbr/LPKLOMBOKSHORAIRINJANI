import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  GraduationCap,
  BriefcaseBusiness,
  ArrowRight,
  TrendingUp,
  History,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  FileText
} from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import { apiClient } from '../../services/apiClient';
import { useRealtimeEvent, useRealtime } from '../../context/RealtimeContext';
import { BRAND } from '../../config/brand';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    activePrograms: 0,
    activeClasses: 0,
    openOpportunities: 0
  });
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [pendingPermissions, setPendingPermissions] = useState(0);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [realtimeNotice, setRealtimeNotice] = useState(null);

  const { onReconnect } = useRealtime();

  const loadAdminDashboard = useCallback(async () => {
    try {
      const [regRes, progRes, classRes, oppRes, logRes, userRes, permRes] = await Promise.allSettled([
        apiClient.get('/admin/registrations'),
        apiClient.get('/admin/programs'),
        apiClient.get('/admin/classes'),
        apiClient.get('/admin/opportunities'),
        apiClient.get('/admin/activity-logs'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/permissions', { params: { status: 'pending' } })
      ]);

      const regs = regRes.status === 'fulfilled' && regRes.value.data?.data ? regRes.value.data.data : [];
      const progs = progRes.status === 'fulfilled' && progRes.value.data?.data ? progRes.value.data.data : [];
      const classes = classRes.status === 'fulfilled' && classRes.value.data?.data ? classRes.value.data.data : [];
      const opps = oppRes.status === 'fulfilled' && oppRes.value.data?.data ? oppRes.value.data.data : [];
      const logs = logRes.status === 'fulfilled' && logRes.value.data?.data ? logRes.value.data.data : [];

      if (userRes.status === 'fulfilled') {
        const uList = userRes.value.data?.data || userRes.value.data || [];
        const pendingU = (Array.isArray(uList) ? uList : []).filter(
          (u) => u.status === 'PENDING' || u.status === 'PENDING_VERIFICATION'
        ).length;
        setPendingApprovals(pendingU);
      }

      if (permRes.status === 'fulfilled') {
        const pList = permRes.value.data?.data || permRes.value.data || [];
        const pendingP = (Array.isArray(pList) ? pList : []).filter(
          (p) => String(p?.status || '').toLowerCase() === 'pending'
        ).length;
        setPendingPermissions(pendingP);
      }

      setStats({
        totalRegistrations: regs.length,
        activePrograms: progs.filter((p) => p.status === 'ACTIVE' || p.status === 'Aktif').length,
        activeClasses: classes.filter((c) => c.status === 'OPEN' || c.status === 'ONGOING').length,
        openOpportunities: opps.filter((o) => o.status === 'OPEN' || o.status === 'Buka').length
      });

      setRecentRegistrations(regs.slice(0, 5));
      setRecentActivities(logs.slice(0, 5));

      const counts = {};
      regs.forEach((r) => {
        const st = String(r?.status || 'NEW').toUpperCase();
        counts[st] = (counts[st] || 0) + 1;
      });
      setStatusCounts(counts);
    } catch (err) {
      console.warn('Admin API fetch failed:', err);
    }
  }, []);

  useEffect(() => {
    loadAdminDashboard();
  }, [loadAdminDashboard]);

  // Auto-resync when connection is restored
  useEffect(() => {
    return onReconnect(() => {
      loadAdminDashboard();
    });
  }, [onReconnect, loadAdminDashboard]);

  // REALTIME EVENT LISTENERS (Admin Channel)
  // 1. Siswa baru mendaftar dari web: Muncul live di Admin Dashboard tanpa refresh
  useRealtimeEvent('registration.created', (data) => {
    const newReg = {
      id: data.id || Date.now(),
      full_name: data.userName || data.fullName,
      fullName: data.userName || data.fullName,
      email: data.email,
      phone: data.phone,
      program_name: data.programTitle,
      programTitle: data.programTitle,
      status: 'NEW',
      created_at: 'Baru saja'
    };

    setRecentRegistrations((prev) => [newReg, ...prev.slice(0, 4)]);
    setStats((prev) => ({ ...prev, totalRegistrations: prev.totalRegistrations + 1 }));
    setStatusCounts((prev) => ({ ...prev, NEW: (prev.NEW || 0) + 1 }));

    setRealtimeNotice(`🔔 Pendaftaran baru diterima: ${newReg.fullName} (${data.programTitle || 'Program'})`);
  });

  // 2. Enrollment created
  useRealtimeEvent('enrollment.created', (data) => {
    setRealtimeNotice(`Alokasi kelas baru: ${data.studentName} dialokasikan ke ${data.className}.`);
  });

  // 3. Attendance recorded
  useRealtimeEvent('attendance.recorded', (data) => {
    const newLog = {
      id: Date.now(),
      action: 'ATTENDANCE',
      description: `Presensi siswa: ${data.userName} (${String(data?.status || '').toUpperCase()}) di ${data.className}.`,
      created_at: 'Baru saja'
    };
    setRecentActivities((prev) => [newLog, ...prev.slice(0, 4)]);
  });

  // 4. Permission created
  useRealtimeEvent('permission.created', (data) => {
    setRealtimeNotice(`Pengajuan izin baru dari ${data.studentName} (${data.type}) untuk kelas ${data.className}.`);
  });

  const statCards = [
    {
      label: 'Total Pendaftaran',
      value: stats.totalRegistrations,
      icon: Users,
      color: '#2563EB',
      bg: '#EFF6FF',
      link: '/admin/registrations'
    },
    {
      label: 'Program Aktif',
      value: stats.activePrograms,
      icon: BookOpen,
      color: 'var(--vermilion)',
      bg: 'var(--vermilion-subtle)',
      link: '/admin/programs'
    },
    {
      label: 'Kelas Berjalan & Buka',
      value: stats.activeClasses,
      icon: GraduationCap,
      color: '#059669',
      bg: '#ECFDF5',
      link: '/admin/classes'
    },
    {
      label: 'Peluang Kerja Buka',
      value: stats.openOpportunities,
      icon: BriefcaseBusiness,
      color: '#B45309',
      bg: '#FEF3C7',
      link: '/admin/opportunities'
    }
  ];

  const pipelineStages = [
    { key: 'NEW', label: 'Baru Masuk', color: '#7C3AED' },
    { key: 'CONTACTED', label: 'Dihubungi WA', color: '#D97706' },
    { key: 'CONSULTATION', label: 'Konsultasi Minat', color: '#2563EB' },
    { key: 'REGISTERED', label: 'Terdaftar Resmi', color: '#059669' },
    { key: 'TRAINING', label: 'Masa Pelatihan', color: '#0284C7' },
    { key: 'COMPLETED', label: 'Siap Berangkat', color: '#16A34A' },
    { key: 'REJECTED', label: 'Batal / Mundur', color: '#DC2626' }
  ];

  return (
    <div>
      {/* Top Welcome / Notice Banner */}
      <div
        style={{
          padding: '1.25rem 1.75rem',
          backgroundColor: 'var(--admin-surface)',
          border: '1px solid var(--admin-border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--vermilion)', fontSize: '0.78rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            <Sparkles size={14} />
            <span>SISTEM OPERASIONAL REALTIME</span>
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text-primary)', margin: '0 0 0.25rem 0' }}>
            Portal Manajemen & Administrasi Terpadu
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)', margin: 0 }}>
            Perubahan pendaftaran, absensi, dan alokasi kelas diterima secara live tanpa reload halaman.
          </p>
        </div>

        <Link
          to="/admin/registrations"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1.1rem',
            backgroundColor: 'var(--vermilion)',
            color: '#FFFFFF',
            fontSize: '0.84rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none'
          }}
        >
          <span>Kelola Registrasi</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Realtime Alert Banner */}
      {realtimeNotice && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            fontSize: '0.86rem',
            fontWeight: 700
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={16} />
            <span>{realtimeNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setRealtimeNotice(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 800 }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Pending Items Action Bar (Rule 11 & Rule 18 shortcuts) */}
      {(pendingApprovals > 0 || pendingPermissions > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {pendingApprovals > 0 && (
            <div
              style={{
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShieldCheck size={20} color="var(--vermilion)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--admin-text-primary)' }}>
                    {pendingApprovals} Verifikasi Akun Menunggu
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                    Pendaftaran siswa/pengajar baru perlu disetujui.
                  </div>
                </div>
              </div>
              <Link
                to="/admin/users?tab=verification"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--vermilion)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Tinjau Akun &rarr;
              </Link>
            </div>
          )}

          {pendingPermissions > 0 && (
            <div
              style={{
                padding: '0.85rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <FileText size={20} color="#D97706" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--admin-text-primary)' }}>
                    {pendingPermissions} Permohonan Izin Menunggu
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                    Pengajuan izin dan sakit siswa perlu ditinjau.
                  </div>
                </div>
              </div>
              <Link
                to="/admin/permissions"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#D97706',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Lihat Permohonan &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              style={{
                display: 'block',
                textDecoration: 'none',
                padding: '1.25rem',
                backgroundColor: 'var(--admin-surface)',
                border: '1px solid var(--admin-border)',
                borderRadius: 'var(--radius-md)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>
                  {card.label}
                </span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: card.bg,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--admin-text-primary)', lineHeight: 1 }}>
                {card.value}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pipeline Status Overview */}
      <div
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--admin-surface)',
          border: '1px solid var(--admin-border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text-primary)', margin: 0 }}>
              Pipeline Seleksi & Verifikasi Calon Siswa
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)', margin: '0.2rem 0 0 0' }}>
              Distribusi status berkas pendaftaran dan proses penempatan kerja Jepang
            </p>
          </div>
          <Link
            to="/admin/registrations"
            style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--vermilion)', textDecoration: 'none' }}
          >
            Buka Pipeline &rarr;
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
            gap: '1rem'
          }}
        >
          {pipelineStages.map((stage) => {
            const count = statusCounts[stage.key] || 0;
            return (
              <div
                key={stage.key}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--admin-surface-muted, rgba(0,0,0,0.02))',
                  border: '1px solid var(--admin-border)',
                  borderTop: `3px solid ${stage.color}`
                }}
              >
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-text-muted)', marginBottom: '0.35rem' }}>
                  {stage.label}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text-primary)' }}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Recent Registrations & Activity Audit */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
        {/* Recent Registrations Table */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--admin-surface)',
            border: '1px solid var(--admin-border)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text-primary)', margin: 0 }}>
              Pendaftaran Terbaru (Live)
            </h3>
            <Link
              to="/admin/registrations"
              style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--vermilion)', textDecoration: 'none' }}
            >
              Lihat Semua &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentRegistrations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--admin-text-muted)', fontSize: '0.84rem' }}>
                Belum ada pendaftaran masuk.
              </div>
            ) : (
              recentRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-surface-muted, rgba(0,0,0,0.01))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--admin-text-primary)' }}>
                      {reg.full_name || reg.fullName}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', marginTop: '0.15rem' }}>
                      {reg.program_name || reg.programTitle || 'Program Tokutei Ginou'}
                    </div>
                  </div>
                  <StatusBadge status={String(reg?.status || 'NEW').toUpperCase()} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Logs (Audit Trail) */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--admin-surface)',
            border: '1px solid var(--admin-border)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text-primary)', margin: 0 }}>
              Log Aktivitas Sistem Terkini
            </h3>
            <Link
              to="/admin/activity-logs"
              style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--vermilion)', textDecoration: 'none' }}
            >
              Audit Log &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--admin-text-muted)', fontSize: '0.84rem' }}>
                Belum ada aktivitas tercatat.
              </div>
            ) : (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  style={{
                    padding: '0.8rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-surface-muted, rgba(0,0,0,0.01))',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem'
                  }}
                >
                  <Clock size={16} color="var(--admin-text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                      {act.description || act.action || 'Aktivitas pengguna'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
                      {act.created_at || 'Baru saja'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
