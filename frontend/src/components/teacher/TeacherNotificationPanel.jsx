import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, GraduationCap, Calendar, ClipboardCheck, BookOpen, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useRealtimeEvent } from '../../context/RealtimeContext';

const getTeacherNotificationIcon = (type) => {
  switch (type) {
    case 'kelas':
      return GraduationCap;
    case 'jadwal':
      return Calendar;
    case 'presensi':
    case 'absensi':
      return ClipboardCheck;
    case 'materi':
      return BookOpen;
    case 'pengumuman':
    default:
      return Megaphone;
  }
};

const initialTeacherNotifications = [
  { id: 1, type: 'kelas', icon: GraduationCap, title: 'Penugasan Angkatan Baru', message: 'Sensei ditugaskan untuk mengampu kelas Batch 50 - Modul Bunpou N4.', isRead: false, createdAt: '20 menit yang lalu', link: '/teacher/classes' },
  { id: 2, type: 'jadwal', icon: Calendar, title: 'Jadwal Mengajar Hari Ini', message: 'Sesi latihan intensif Kanji dimulai pukul 08.30 WITA di Ruang Sakura.', isRead: false, createdAt: '1 jam yang lalu', link: '/teacher/schedule' },
  { id: 3, type: 'presensi', icon: ClipboardCheck, title: 'Presensi Sesi Pagi', message: '19 dari 20 siswa binaan telah melakukan absensi mandiri.', isRead: false, createdAt: '2 jam yang lalu', link: '/teacher/attendance' },
  { id: 4, type: 'materi', icon: BookOpen, title: 'Pembaruan Dokumen Kurikulum', message: 'Silabus persiapan SSW Kaigo Bab 5 telah diperbarui di sistem.', isRead: true, createdAt: '1 hari yang lalu', link: '/teacher/materials' },
  { id: 5, type: 'pengumuman', icon: Megaphone, title: 'Rapat Evaluasi Sensei Bulanan', message: 'Pertemuan evaluasi kompetensi siswa dijadwalkan Jumat pukul 16.00 WITA.', isRead: true, createdAt: '2 hari yang lalu', link: '/teacher/dashboard' }
];

export default function TeacherNotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialTeacherNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/teacher/notifications');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const formatted = res.data.data.map((item) => ({
          id: item.id,
          type: item.type,
          icon: getTeacherNotificationIcon(item.type),
          title: item.title,
          message: item.message,
          isRead: item.isRead || item.is_read,
          createdAt: item.createdAtFormatted || 'Baru saja',
          link: item.actionUrl || item.action_url || '/teacher/dashboard'
        }));
        setNotifications(formatted);
        setUnreadCount(typeof res.data.unreadCount === 'number' ? res.data.unreadCount : formatted.filter(n => !n.isRead).length);
      }
    } catch (err) {
      setUnreadCount(initialTeacherNotifications.filter(n => !n.isRead).length);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useRealtimeEvent('notification.created', (newNotif) => {
    const formatted = {
      id: newNotif.id || Date.now(),
      type: newNotif.type || 'pengumuman',
      icon: getTeacherNotificationIcon(newNotif.type),
      title: newNotif.title || 'Pemberitahuan Baru',
      message: newNotif.message || '',
      isRead: false,
      createdAt: 'Baru saja',
      link: newNotif.action_url || newNotif.actionUrl || '/teacher/dashboard'
    };

    setNotifications((prev) => [formatted, ...prev.filter(n => n.id !== formatted.id)]);
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

    apiClient.post(`/teacher/notifications/${id}/read`).catch(() => {});
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    apiClient.post('/teacher/notifications/read-all').catch(() => {});
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
          border: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--surface, var(--bg-surface))',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        aria-label={unreadCount > 0 ? `${unreadCount} pemberitahuan pengajar belum dibaca` : 'Pemberitahuan Pengajar'}
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
            width: 'min(calc(100vw - 2rem), 360px)',
            backgroundColor: 'var(--surface, var(--bg-surface))',
            border: '1px solid var(--border-subtle)',
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
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--surface-muted, var(--bg-surface-subtle))'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} color="var(--vermilion)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Pemberitahuan Pengajar
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
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                Tidak ada pemberitahuan baru
              </div>
            ) : (
              notifications.map((item) => {
                const Icon = item.icon || Bell;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item.id)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: item.isRead ? 'transparent' : 'var(--surface-muted, rgba(197, 48, 48, 0.04))',
                      display: 'flex',
                      gap: '0.65rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: item.isRead ? 'var(--border-subtle)' : 'var(--vermilion-subtle)',
                        color: item.isRead ? 'var(--text-muted)' : 'var(--vermilion)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      <Icon size={16} />
                    </div>

                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.84rem',
                          fontWeight: item.isRead ? 600 : 750,
                          color: 'var(--text-primary)',
                          lineHeight: 1.3,
                          marginBottom: '0.2rem'
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.35,
                          marginBottom: '0.35rem'
                        }}
                      >
                        {item.message}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {item.createdAt}
                        </span>
                        {item.link && (
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
                            Buka Menu &rarr;
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
