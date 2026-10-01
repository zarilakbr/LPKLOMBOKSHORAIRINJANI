import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockNotifications = [
  { id: 1, type: 'registration', title: 'Pendaftaran Siswa Baru', message: 'Siswa atas nama Budi Santoso mendaftar ke kelas Bahasa Jepang N4.', isRead: false, createdAt: '10 menit yang lalu', link: '/admin/registrations' },
  { id: 2, type: 'contact', title: 'Pesan Kontak Masuk', message: 'Pertanyaan calon siswa via formulir website: "Informasi jadwal kelas malam".', isRead: false, createdAt: '1 jam yang lalu', link: null },
  { id: 3, type: 'program', title: 'Pembaruan Program Pelatihan', message: 'Program Tokutei Ginou Kaigo siap dibuka untuk gelombang pendaftaran baru.', isRead: true, createdAt: '1 hari yang lalu', link: '/admin/programs' },
  { id: 4, type: 'class', title: 'Penyesuaian Jadwal Kelas', message: 'Kelas Bahasa Jepang N5 Batch B berhasil diperbarui ruang kelasnya.', isRead: true, createdAt: '2 hari yang lalu', link: '/admin/classes' },
  { id: 5, type: 'activity', title: 'Log Aktivitas Pengguna', message: 'Pengajar sensei melakukan input nilai ujian formatif JLPT N4.', isRead: true, createdAt: '2 hari yang lalu', link: '/admin/activity-logs' },
  { id: 6, type: 'system', title: 'Sistem Pemeliharaan', message: 'Backup berkala database dan audit log sistem selesai dijalankan.', isRead: true, createdAt: '3 hari yang lalu', link: '/admin/activity-logs' },
];

export default function AdminNotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const panelRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (id) => {
    handleMarkAsRead(id);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '0.45rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--admin-border)',
          backgroundColor: 'var(--admin-surface)',
          color: 'var(--admin-text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        aria-label={unreadCount > 0 ? `${unreadCount} pemberitahuan belum dibaca` : 'Pemberitahuan'}
        aria-expanded={isOpen}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: 'var(--vermilion)',
            color: '#FFF',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            minWidth: '16px',
            height: '16px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 'min(90vw, 380px)',
          backgroundColor: 'var(--admin-surface)',
          border: '1px solid var(--admin-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '400px',
          overflow: 'hidden',
          animation: 'navFadeIn 0.2s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            borderBottom: '1px solid var(--admin-border)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--admin-text-primary)' }}>Pemberitahuan</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                style={{ fontSize: '0.75rem', color: 'var(--vermilion)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}
                className="admin-action-btn"
                title="Tandai semua dibaca"
              >
                <CheckCheck size={14} /> Tandai dibaca
              </button>
            )}
          </div>
          
          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--admin-text-muted)' }}>
                Belum ada pemberitahuan baru.
              </div>
            ) : (
              notifications.map(item => (
                <div key={item.id} style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--admin-border)',
                  backgroundColor: item.isRead ? 'transparent' : 'var(--admin-row-hover)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text-primary)', paddingRight: '20px' }}>
                      {item.title}
                    </div>
                    {!item.isRead && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--vermilion)', flexShrink: 0, marginTop: '4px' }}></span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-secondary)', margin: '0 0 0.5rem 0' }}>
                    {item.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>{item.createdAt}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!item.isRead && (
                        <button onClick={() => handleMarkAsRead(item.id)} style={{ color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem' }}>
                          <Check size={12} /> Dibaca
                        </button>
                      )}
                      {item.link && (
                        <Link to={item.link} onClick={() => handleNotificationClick(item.id)} style={{ color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', textDecoration: 'none' }}>
                          Lihat Detail <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--admin-border)', textAlign: 'center', backgroundColor: 'var(--admin-bg)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Menampilkan 5 pemberitahuan terakhir (Mock)</span>
          </div>
        </div>
      )}
    </div>
  );
}
