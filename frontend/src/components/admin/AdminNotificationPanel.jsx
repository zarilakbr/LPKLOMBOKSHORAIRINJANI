import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useRealtimeEvent } from '../../context/RealtimeContext';

const mockNotifications = [
  { id: 1, type: 'registration', title: 'Pendaftaran Siswa Baru', message: 'Siswa atas nama Budi Santoso mendaftar ke kelas Bahasa Jepang N4.', isRead: false, createdAt: '10 menit yang lalu', link: '/admin/registrations' },
  { id: 2, type: 'contact', title: 'Pesan Kontak Masuk', message: 'Pertanyaan calon siswa via formulir website: "Informasi jadwal kelas malam".', isRead: false, createdAt: '1 jam yang lalu', link: null },
  { id: 3, type: 'program', title: 'Pembaruan Program Pelatihan', message: 'Program Tokutei Ginou Kaigo siap dibuka untuk gelombang pendaftaran baru.', isRead: true, createdAt: '1 hari yang lalu', link: '/admin/programs' },
  { id: 4, type: 'class', title: 'Penyesuaian Jadwal Kelas', message: 'Kelas Bahasa Jepang N5 Batch B berhasil diperbarui ruang kelasnya.', isRead: true, createdAt: '2 hari yang lalu', link: '/admin/classes' },
  { id: 5, type: 'activity', title: 'Log Aktivitas Pengguna', message: 'Pengajar sensei melakukan input presensi kehadiran siswa.', isRead: true, createdAt: '2 hari yang lalu', link: '/admin/activity-logs' },
];

export default function AdminNotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/admin/notifications');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const formatted = res.data.data.map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          message: item.message,
          isRead: item.isRead || item.is_read,
          createdAt: item.createdAtFormatted || 'Baru saja',
          link: item.actionUrl || item.action_url || '/admin/dashboard'
        }));
        setNotifications(formatted);
        setUnreadCount(typeof res.data.unreadCount === 'number' ? res.data.unreadCount : formatted.filter(n => !n.isRead).length);
      }
    } catch (err) {
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Realtime: New student registered!
  useRealtimeEvent('registration.created', (data) => {
    const newNotif = {
      id: Date.now(),
      type: 'registration',
      title: 'Pendaftaran Siswa Baru',
      message: `${data.userName || 'Siswa baru'} mendaftar ke ${data.programTitle || 'program pelatihan'}.`,
      isRead: false,
      createdAt: 'Baru saja',
      link: '/admin/registrations'
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setUnreadCount((prev) => prev + 1);
  });

  // Realtime: New permission created
  useRealtimeEvent('permission.created', (data) => {
    const newNotif = {
      id: Date.now(),
      type: 'permission',
      title: 'Pengajuan Izin Siswa',
      message: `${data.studentName || 'Siswa'} mengajukan izin ${data.type || ''} (${data.startDate || ''}).`,
      isRead: false,
      createdAt: 'Baru saja',
      link: '/admin/dashboard'
    };
    setNotifications((prev) => [newNotif, ...prev]);
    setUnreadCount((prev) => prev + 1);
  });

  // Realtime: Direct notification
  useRealtimeEvent('notification.created', (newNotif) => {
    const formatted = {
      id: newNotif.id || Date.now(),
      type: newNotif.type || 'system',
      title: newNotif.title || 'Notifikasi Admin',
      message: newNotif.message || '',
      isRead: false,
      createdAt: 'Baru saja',
      link: newNotif.action_url || newNotif.actionUrl || '/admin/dashboard'
    };
    setNotifications((prev) => [formatted, ...prev]);
    setUnreadCount((prev) => prev + 1);
  });

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
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    apiClient.post(`/admin/notifications/${id}/read`).catch(() => {});
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    apiClient.post('/admin/notifications/read-all').catch(() => {});
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
        type="button"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: 'var(--vermilion)',
              color: '#FFFFFF',
              fontSize: '0.62rem',
              fontWeight: 800,
              minWidth: '16px',
              height: '16px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 'min(calc(100vw - 2rem), 380px)',
            backgroundColor: 'var(--admin-surface)',
            border: '1px solid var(--admin-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-hover)',
            zIndex: 300,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '420px',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderBottom: '1px solid var(--admin-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--admin-surface-muted, rgba(0,0,0,0.02))'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} color="var(--vermilion)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--admin-text-primary)' }}>
                Pusat Notifikasi Realtime
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--vermilion-subtle)',
                    color: 'var(--vermilion)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '12px'
                  }}
                >
                  {unreadCount} Baru
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--vermilion)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Tandai Dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flexGrow: 1, padding: '0.25rem 0' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.84rem' }}>
                Tidak ada pemberitahuan baru
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: item.isRead ? 'transparent' : 'rgba(197, 48, 48, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span
                      style={{
                        fontSize: '0.84rem',
                        fontWeight: item.isRead ? 600 : 800,
                        color: 'var(--admin-text-primary)'
                      }}
                    >
                      {item.title}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>
                      {item.createdAt}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--admin-text-secondary)',
                      margin: 0,
                      lineHeight: 1.35
                    }}
                  >
                    {item.message}
                  </p>
                  {item.link && (
                    <div style={{ marginTop: '0.25rem' }}>
                      <Link
                        to={item.link}
                        onClick={() => setIsOpen(false)}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--vermilion)',
                          textDecoration: 'none'
                        }}
                      >
                        Buka Detail &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
