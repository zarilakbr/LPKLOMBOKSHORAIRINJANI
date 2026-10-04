import React from 'react';
import { Menu, ExternalLink } from 'lucide-react';
import AdminNotificationPanel from './AdminNotificationPanel';
import RealtimeStatusBadge from '../common/RealtimeStatusBadge';

/**
 * Admin Topbar Component
 * Displays current page title, notifications, and public website link.
 * Note: Logout action is centralized in AdminSidebar footer to prevent UI duplication.
 */
export default function AdminTopbar({ onToggleMobile, title = 'Dashboard Manajemen' }) {
  return (
    <>
      <header className="admin-topbar">
        {/* Left Side: Mobile Toggle & Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onToggleMobile}
            style={{
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--admin-border)',
              backgroundColor: 'var(--admin-surface)',
              color: 'var(--admin-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="admin-mobile-toggle"
            type="button"
            aria-label="Buka Menu Sidebar"
          >
            <Menu size={20} />
          </button>

          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text-primary)', margin: 0, lineHeight: 1.2 }}>
              {title}
            </h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
              LPK Lombok Shorai Rinjani Administrative Platform
            </div>
          </div>
        </div>

        {/* Right Side: Notification & Quick Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <RealtimeStatusBadge />
          <AdminNotificationPanel />

          {/* View Public Website */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="admin-desktop-control"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--admin-text-secondary)',
              border: '1px solid var(--admin-border)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--admin-surface)'
            }}
            title="Buka Website Publik"
          >
            <span>Website Publik</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </header>

      <style>{`
        @media (min-width: 1025px) {
          .admin-mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
