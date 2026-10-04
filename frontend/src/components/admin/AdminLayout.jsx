import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import AdminErrorBoundary from './AdminErrorBoundary';
import { authService } from '../../services/dataService';
import DashboardFooter from '../common/DashboardFooter';
import '../../styles/admin.css';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

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

  // Strict RBAC Separation: Only accounts with role 'ADMIN' can access Admin Dashboard
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return <Navigate to="/login?portal=admin" replace />;
  }

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/admin/dashboard':
        return 'Ringkasan Dashboard';
      case '/admin/programs':
        return 'Kelola Program Pelatihan';
      case '/admin/classes':
        return 'Jadwal & Kuota Angkatan Kelas';
      case '/admin/materials':
        return 'Materi Pembelajaran LMS';
      case '/admin/opportunities':
        return 'Peluang Kerja Tokutei Ginou';
      case '/admin/registrations':
        return 'Pendaftaran & Pipeline Siswa';
      case '/admin/testimonials':
        return 'Testimoni & Cerita Alumni';
      case '/admin/articles':
        return 'Manajemen Artikel & Edukasi';
      case '/admin/gallery':
        return 'Galeri Foto & Dokumentasi';
      case '/admin/facilities':
        return 'Fasilitas & Sarana Lembaga';
      case '/admin/faqs':
        return 'Kelola Tanya Jawab (FAQ)';
      case '/admin/users':
        return 'Pengguna & Hak Akses (RBAC)';
      case '/admin/settings':
        return 'Konfigurasi Lembaga & Web';
      case '/admin/activity-logs':
        return 'Log Audit Aktivitas Sistem';
      default:
        return 'Admin Panel';
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 190
          }}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main Container */}
      <div className="admin-main">
        <AdminTopbar
          title={getPageTitle(location.pathname)}
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
        />
        <div className="admin-scroll-container">
          <main className="admin-content">
            <AdminErrorBoundary>
              <Outlet />
            </AdminErrorBoundary>
          </main>
          <DashboardFooter role="admin" />
        </div>
      </div>
    </div>
  );
}
