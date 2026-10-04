import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  Settings,
  History,
  LogOut,
  X,
  Globe,
  BookMarked,
  Calendar,
  UserCheck,
  ClipboardCheck,
  FileText,
  Bell
} from 'lucide-react';
import { authService } from '../../services/dataService';
import { BRAND } from '../../config/brand';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';

export default function AdminSidebar({ mobileOpen, onCloseMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();
  const { language, setLanguage } = useLanguage();

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await authService.logout();
    navigate('/admin/login');
  };

  const navSections = [
    {
      title: null,
      items: [
        { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'AKADEMIK',
      items: [
        { label: 'Program', to: '/admin/programs', icon: BookOpen },
        { label: 'Kelas', to: '/admin/classes', icon: GraduationCap },
        { label: 'Enrollment', to: '/admin/enrollments', icon: UserCheck },
        { label: 'Materi', to: '/admin/materials', icon: BookMarked },
        { label: 'Jadwal', to: '/admin/schedules', icon: Calendar },
        { label: 'Absensi', to: '/admin/attendance', icon: ClipboardCheck }
      ]
    },
    {
      title: 'PENGGUNA',
      items: [
        { label: 'Pengguna', to: '/admin/users', icon: Users }
      ]
    },
    {
      title: 'LAYANAN',
      items: [
        { label: 'Perizinan', to: '/admin/permissions', icon: FileText },
        { label: 'Notifikasi', to: '/admin/notifications', icon: Bell }
      ]
    },
    {
      title: 'KONTEN',
      items: [
        { label: 'Artikel', to: '/admin/articles', icon: Newspaper },
        { label: 'Galeri', to: '/admin/gallery', icon: Images },
        { label: 'Fasilitas', to: '/admin/facilities', icon: Building2 },
        { label: 'FAQ', to: '/admin/faqs', icon: CircleHelp },
        { label: 'Testimonial', to: '/admin/testimonials', icon: MessageSquareQuote },
        { label: 'Kesempatan', to: '/admin/opportunities', icon: BriefcaseBusiness }
      ]
    },
    {
      title: 'SISTEM',
      items: [
        { label: 'Pengaturan', to: '/admin/settings', icon: Settings },
        { label: 'Activity Logs', to: '/admin/activity-logs', icon: History }
      ]
    }
  ];

  const isItemActive = (to) => {
    if (to.includes('?')) {
      const [path, query] = to.split('?');
      if (location.pathname !== path) return false;
      const searchParams = new URLSearchParams(location.search);
      const targetParams = new URLSearchParams(query);
      for (const [key, val] of targetParams.entries()) {
        if (searchParams.get(key) !== val) {
          // If query is tab=all and there's no tab param, consider it default active
          if (key === 'tab' && val === 'all' && !searchParams.has('tab')) {
            continue;
          }
          return false;
        }
      }
      return true;
    }
    return location.pathname === to;
  };

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
        {navSections.map((section, idx) => (
          <div key={section.title || `section-${idx}`} style={{ marginBottom: '0.65rem' }}>
            {section.title && (
              <div
                style={{
                  padding: '0.5rem 0.85rem 0.25rem 0.85rem',
                  fontSize: '0.67rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: 'var(--admin-sidebar-text-muted)',
                  textTransform: 'uppercase'
                }}
              >
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={`admin-nav-item ${active ? 'active' : ''}`}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
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
