import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../../config/brand';

/**
 * Reusable Functional Dashboard Footer for:
 * - Student Dashboard (/dashboard)
 * - Teacher Dashboard (/teacher/dashboard)
 * - Admin Dashboard (/admin/dashboard)
 * 
 * Clean, lightweight, professional, and non-intrusive.
 * Positioned with marginTop: auto to always sit properly at the bottom.
 */
export default function DashboardFooter({ role = 'portal' }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="dashboard-footer"
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--surface, #FFFFFF)',
        padding: '1rem clamp(1rem, 3vw, 2rem)',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        flexShrink: 0,
        boxSizing: 'border-box',
        width: '100%'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
          &copy; {currentYear} {BRAND.name}.
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Hak Cipta Dilindungi.
        </span>
      </div>

      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap'
        }}
        aria-label="Navigasi Bantuan Dashboard"
      >
        <Link
          to="/faq"
          style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'color 0.2s',
            fontWeight: 500
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--vermilion)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          Pusat Bantuan
        </Link>
        <span style={{ color: 'var(--border-subtle)' }}>|</span>
        <Link
          to="/about"
          style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'color 0.2s',
            fontWeight: 500
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--vermilion)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          Kebijakan Lembaga
        </Link>
        <span style={{ color: 'var(--border-subtle)' }}>|</span>
        <Link
          to="/contact"
          style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'color 0.2s',
            fontWeight: 500
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--vermilion)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          Kontak
        </Link>
      </nav>
    </footer>
  );
}
