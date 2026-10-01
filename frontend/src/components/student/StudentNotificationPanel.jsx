import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CalendarCheck, Calendar, FileText, FileCheck, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const initialStudentNotifications = [
  { id: 1, type: 'pendaftaran', icon: FileText, title: 'Status Berkas Pendaftaran', message: 'Dokumen pendaftaran program Anda sedang dalam verifikasi konselor.', isRead: false, createdAt: '15 menit yang lalu', link: '/dashboard/registrations' },
  { id: 2, type: 'jadwal', icon: Calendar, title: 'Jadwal Kelas Berikutnya', message: 'Sesi Kanji & Kaiwa Bahasa Jepang N4 dijadwalkan besok pukul 08.00 WITA.', isRead: false, createdAt: '1 jam yang lalu', link: '/dashboard/schedule' },
  { id: 3, type: 'absensi', icon: CalendarCheck, title: 'Pengingat Presensi Harian', message: 'Jangan lupa mengisi absensi kehadiran sebelum sesi kelas dimulai.', isRead: false, createdAt: '3 jam yang lalu', link: '/dashboard/attendance' },
  { id: 4, type: 'izin', icon: FileCheck, title: 'Pengajuan Izin Disetujui', message: 'Pengajuan dispensasi tanggal 25 September telah disetujui sensei pengajar.', isRead: true, createdAt: '1 hari yang lalu', link: '/dashboard/permission' },
  { id: 5, type: 'pengumuman', icon: Megaphone, title: 'Pengumuman Try Out JLPT', message: 'Simulasi ujian mandiri JFT & JLPT N4 akan diselenggarakan hari Sabtu ini.', isRead: true, createdAt: '2 hari yang lalu', link: '/dashboard/notifications' }
];

export default function StudentNotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialStudentNotifications);
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
          border: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--surface, var(--bg-surface))',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        aria-label={unreadCount > 0 ? `${unreadCount} pemberitahuan siswa belum dibaca` : 'Pemberitahuan Siswa'}
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
                Pemberitahuan Siswa
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
