import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  BriefcaseBusiness,
  Users,
  MessageSquareQuote,
  Newspaper,
  Images,
  Building2,
  CircleHelp,
  ShieldCheck,
  Settings,
  History,
  LogOut,
  X,
  Globe
} from 'lucide-react';
import { authService } from '../../services/dataService';
import { BRAND } from '../../config/brand';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';

export default function AdminSidebar({ mobileOpen, onCloseMobile }) {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const { language, setLanguage } = useLanguage();

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await authService.logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Kelola Program', to: '/admin/programs', icon: BookOpen },
    { label: 'Jadwal Kelas', to: '/admin/classes', icon: GraduationCap },
    { label: 'Peluang Kerja', to: '/admin/opportunities', icon: BriefcaseBusiness },
    { label: 'Pendaftaran Siswa', to: '/admin/registrations', icon: Users },
    { label: 'Testimoni Alumni', to: '/admin/testimonials', icon: MessageSquareQuote },
    { label: 'Artikel & Berita', to: '/admin/articles', icon: Newspaper },
    { label: 'Galeri Foto', to: '/admin/gallery', icon: Images },
    { label: 'Fasilitas Kampus', to: '/admin/facilities', icon: Building2 },
    { label: 'Manajemen FAQ', to: '/admin/faqs', icon: CircleHelp },
    { label: 'Pengguna & Hak Akses', to: '/admin/users', icon: ShieldCheck },
    { label: 'Pengaturan Lembaga', to: '/admin/settings', icon: Settings },
    { label: 'Log Aktivitas Sistem', to: '/admin/activity-logs', icon: History }
  ];

  return (
    <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Sidebar Header */}
      <div className="admin-sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexGrow: 1, minWidth: 0 }}>
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
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--admin-sidebar-text)', letterSpacing: '-0.01em', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {BRAND.name}
          </div>
        </div>

        {/* Mobile close toggle */}
        <button
          onClick={onCloseMobile}
          style={{
            display: mobileOpen ? 'flex' : 'none',
            color: 'var(--admin-sidebar-text-muted)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-sm)',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
          type="button"
          aria-label="Tutup Menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation List - Scrolls internally with ZERO narrow scrollbar strip */}
      <nav className="admin-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Drawer Utilities & User Footer */}
      <div className="admin-sidebar-footer">
        {/* Language & Theme Controls (Available directly inside drawer) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingBottom: '0.85rem', marginBottom: '0.85rem', borderBottom: '1px solid var(--admin-sidebar-border)' }}>
          {/* Language Selection Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--admin-sidebar-text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
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
                    borderColor: language === lang.code ? 'var(--vermilion)' : 'var(--admin-sidebar-border)',
                    backgroundColor: language === lang.code ? 'rgba(197, 48, 48, 0.2)' : 'transparent',
                    color: language === lang.code ? '#FDA4AF' : 'var(--admin-sidebar-text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Info & Logout Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--admin-sidebar-hover)',
                color: 'var(--admin-sidebar-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                flexShrink: 0
              }}
            >
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-sidebar-text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--vermilion)', fontWeight: 700 }}>
                {currentUser?.role || 'ADMIN'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '0.4rem 0.55rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#FCA5A5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              flexShrink: 0
            }}
            title="Keluar dari Panel Admin"
            aria-label="Logout"
          >
            <LogOut size={13} />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
