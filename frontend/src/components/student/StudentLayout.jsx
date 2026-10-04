import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FileText,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  CalendarCheck,
  FileCheck,
  Bell,
  Globe,
  BookMarked
} from 'lucide-react';
import { studentAuthService } from '../../services/dataService';
import { BRAND } from '../../config/brand';
import StudentNotificationPanel from './StudentNotificationPanel';
import RealtimeStatusBadge from '../common/RealtimeStatusBadge';
import DashboardFooter from '../common/DashboardFooter';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';
import '../../styles/student.css';

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentStudent = studentAuthService.getCurrentUser();
  const { language, setLanguage } = useLanguage();

  // Strict RBAC Separation: Only accounts with role 'SISWA' can access Student Dashboard
  if (!currentStudent || currentStudent.role !== 'SISWA') {
    return <Navigate to="/login?portal=student" replace />;
  }

  // Prevent background scrolling when mobile drawer is open, cleanly unlock when closed
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (mobileOpen) setMobileOpen(false);
    studentAuthService.logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Profil Saya', to: '/dashboard/profile', icon: User },
    { label: 'Pendaftaran Saya', to: '/dashboard/registrations', icon: FileText },
    { label: 'Program Saya', to: '/dashboard/programs', icon: BookOpen },
    { label: 'Materi Belajar', to: '/dashboard/materials', icon: BookMarked },
    { label: 'Jadwal', to: '/dashboard/schedule', icon: Calendar },
    { label: 'Absensi', to: '/dashboard/attendance', icon: CalendarCheck },
    { label: 'Izin', to: '/dashboard/permission', icon: FileCheck },
    { label: 'Pemberitahuan', to: '/dashboard/notifications', icon: Bell },
    { label: 'Pengaturan', to: '/dashboard/settings', icon: Settings }
  ];

  return (
    <div className="student-layout">
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(2px)',
            zIndex: 190
          }}
        />
      )}

      {/* Student Sidebar Shell (Desktop Static Sidebar / Mobile Slide-in Drawer) */}
      <aside className={`student-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="student-sidebar-header">
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              flexGrow: 1,
              minWidth: 0
            }}
          >
            <img
              src={BRAND.logo}
              alt={BRAND.name}
              style={{
                width: '36px',
                height: '36px',
                objectFit: 'contain',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                padding: '2px',
                flexShrink: 0
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {BRAND.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--vermilion)', fontWeight: 700 }}>
                Portal Siswa
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            style={{
              display: mobileOpen ? 'flex' : 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: 'var(--radius-sm)'
            }}
            aria-label="Tutup Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items (Scrollable internally without narrow vertical scrollbar strip) */}
        <nav className="student-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `student-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Drawer Utilities & Student Profile Footer */}
        <div className="student-sidebar-footer">
          {/* Mobile Drawer Language & Theme Controls */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              paddingBottom: '0.85rem',
              marginBottom: '0.85rem',
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            {/* Language Selector Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Globe size={13} />
                <span>Bahasa</span>
              </span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    style={{
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.72rem',
                      fontWeight: language === lang.code ? 700 : 500,
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: language === lang.code ? 'var(--vermilion)' : 'var(--border-subtle)',
                      backgroundColor: language === lang.code ? 'var(--vermilion-subtle)' : 'transparent',
                      color: language === lang.code ? 'var(--vermilion)' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Student Profile Quick Pill & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--vermilion)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  flexShrink: 0
                }}
              >
                {currentStudent?.name?.charAt(0) || 'S'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden'
                  }}
                >
                  {currentStudent?.name || 'Siswa LPK'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--vermilion)', fontWeight: 700 }}>
                  Siswa Aktif
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: '0.4rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--vermilion-border)',
                backgroundColor: 'var(--vermilion-subtle)',
                color: 'var(--vermilion)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                flexShrink: 0
              }}
              title="Keluar dari Akun Siswa"
              aria-label="Logout"
            >
              <LogOut size={13} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="student-main-content">
        <header className="student-topbar">
          {/* Left: Mobile Drawer Toggle & Page Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: 'none',
                background: 'none',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
              className="student-mobile-toggle"
              aria-label="Buka Menu Navigasi"
            >
              <Menu size={20} />
            </button>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Dashboard Siswa
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                LPK Lombok Shorai Rinjani Student Platform
              </div>
            </div>
          </div>

          {/* Right: Notification & Website Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <RealtimeStatusBadge />
            <StudentNotificationPanel />

            <Link
              to="/"
              className="student-desktop-control"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-muted)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <span>Website Publik</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </header>

        {/* Scrollable Container with Content and Functional Dashboard Footer */}
        <div className="student-scroll-container">
          <main className="student-body">
            <Outlet />
          </main>
          <DashboardFooter role="siswa" />
        </div>
      </div>
    </div>
  );
}
