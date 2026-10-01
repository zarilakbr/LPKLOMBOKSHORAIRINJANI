import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import {
  programService,
  classService,
  opportunityService,
  registrationService,
  activityLogService
} from '../../services/dataService';
import { BRAND } from '../../config/brand';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    activePrograms: 0,
    activeClasses: 0,
    openOpportunities: 0
  });
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});

  useEffect(() => {
    Promise.all([
      registrationService.getAll(),
      programService.getAll(),
      classService.getAll(),
      opportunityService.getAll(),
      activityLogService.getAll()
    ]).then(([regs, progs, classes, opps, logs]) => {
      setStats({
        totalRegistrations: regs.length,
        activePrograms: progs.filter((p) => p.status === 'ACTIVE').length,
        activeClasses: classes.filter((c) => c.status === 'OPEN' || c.status === 'ONGOING').length,
        openOpportunities: opps.filter((o) => o.status === 'OPEN').length
      });

      setRecentRegistrations(regs.slice(0, 5));
      setRecentActivities(logs.slice(0, 5));

      // Calculate pipeline distribution
      const counts = {};
      regs.forEach((r) => {
        counts[r.status] = (counts[r.status] || 0) + 1;
      });
      setStatusCounts(counts);
    });
  }, []);

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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text-primary)', margin: 0 }}>
            Selamat Datang di Panel Pengelolaan {BRAND.name}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)', margin: '0.25rem 0 0 0' }}>
            Data di bawah ini disajikan menggunakan lapisan mock data pengembangan terisolasi (Phase 2).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/admin/registrations" className="btn btn-primary btn-sm">
            Lihat Pendaftar Masuk
          </Link>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link key={idx} to={card.link} className="admin-stat-card" style={{ textDecoration: 'none' }}>
              <div>
                <div className="admin-stat-label">{card.label}</div>
                <div className="admin-stat-value">{card.value}</div>
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: card.bg,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon size={24} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Middle Grid: Pipeline Status Distribution & Recent Activities */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.35fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
        className="dashboard-split"
      >
        {/* Registration Pipeline Visual Progress */}
        <div
          style={{
            backgroundColor: 'var(--admin-surface)',
            border: '1px solid var(--admin-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--admin-text-primary)', margin: 0 }}>
                Status Pipeline Pendaftaran Siswa
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', margin: '0.2rem 0 0 0' }}>
                Distribusi status proses seleksi & penerimaan calon peserta
              </p>
            </div>
            <Link to="/admin/registrations" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--vermilion)' }}>
              Kelola Pipeline &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {pipelineStages.map((stage) => {
              const count = statusCounts[stage.key] || 0;
              const percent = stats.totalRegistrations > 0
                ? Math.round((count / stats.totalRegistrations) * 100)
                : 0;

              return (
                <div key={stage.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--admin-text-secondary)' }}>{stage.label}</span>
                    <span style={{ fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                      {count} Siswa ({percent}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--admin-row-border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        backgroundColor: stage.color,
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div
          style={{
            backgroundColor: 'var(--admin-surface)',
            border: '1px solid var(--admin-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--admin-text-primary)', margin: 0 }}>
                Aktivitas Terbaru
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', margin: '0.2rem 0 0 0' }}>
                Log mutasi sistem administratif
              </p>
            </div>
            <Link to="/admin/activity-logs" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--vermilion)' }}>
              Lihat Log &rarr;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentActivities.map((act) => (
              <div key={act.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--admin-row-border)',
                    color: 'var(--vermilion)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '0.1rem'
                  }}
                >
                  <History size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-primary)', fontWeight: 500, lineHeight: 1.4 }}>
                    {act.description}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '0.2rem' }}>
                    {act.user} • {act.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Registrations */}
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--admin-text-primary)', margin: 0 }}>
              Pendaftaran Siswa Masuk Terbaru
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-secondary)', margin: '0.2rem 0 0 0' }}>
              Data formulir yang diisi oleh calon peserta didik
            </p>
          </div>

          <Link to="/admin/registrations" className="btn btn-outline btn-sm">
            Semua Pendaftaran &rarr;
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>No. Reg</th>
                <th>Nama Siswa</th>
                <th>Kontak WhatsApp</th>
                <th>Program Minat</th>
                <th>Asal Kota</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Tanggal Masuk</th>
              </tr>
            </thead>
            <tbody>
              {recentRegistrations.map((reg) => (
                <tr key={reg.id}>
                  <td style={{ fontWeight: 700, color: 'var(--vermilion)' }}>
                    {reg.registrationCode}
                  </td>
                  <td style={{ fontWeight: 600 }}>{reg.fullName}</td>
                  <td>{reg.phone}</td>
                  <td>{reg.programInterest}</td>
                  <td>{reg.city}</td>
                  <td>
                    <StatusBadge status={reg.status} />
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                    {reg.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .dashboard-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
