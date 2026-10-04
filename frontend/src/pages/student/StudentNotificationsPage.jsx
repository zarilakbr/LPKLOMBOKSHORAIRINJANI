import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Calendar, CalendarCheck, FileText, FileCheck, Megaphone, CheckCircle2, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useRealtimeEvent, useRealtime } from '../../context/RealtimeContext';

const getCategoryIcon = (type) => {
  switch (type) {
    case 'pendaftaran':
      return FileText;
    case 'jadwal':
      return Calendar;
    case 'absensi':
      return CalendarCheck;
    case 'izin':
      return FileCheck;
    case 'pengumuman':
    default:
      return Megaphone;
  }
};

export default function StudentNotificationsPage() {
  const [filterType, setFilterType] = useState('ALL');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const { onReconnect } = useRealtime();

  const loadNotifications = useCallback(async () => {
    try {
      const res = await apiClient.get('/student/notifications');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const formatted = res.data.data.map((item) => ({
          id: item.id,
          type: item.type,
          icon: getCategoryIcon(item.type),
          category: (item.type || 'Umum').toUpperCase(),
          title: item.title,
          message: item.message,
          isRead: Boolean(item.isRead ?? item.is_read),
          createdAt: item.createdAtFormatted || 'Baru saja',
          link: item.actionUrl || item.action_url || null
        }));
        setNotifications(formatted);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Auto-resync when connection is restored
  useEffect(() => {
    return onReconnect(() => {
      loadNotifications();
    });
  }, [onReconnect, loadNotifications]);

  // REALTIME EVENT: Notification Created
  useRealtimeEvent('notification.created', (newNotif) => {
    const formatted = {
      id: newNotif.id || Date.now(),
      type: newNotif.type || 'pengumuman',
      icon: getCategoryIcon(newNotif.type),
      category: (newNotif.type || 'Pemberitahuan').toUpperCase(),
      title: newNotif.title || 'Pemberitahuan Baru',
      message: newNotif.message || '',
      isRead: false,
      createdAt: 'Baru saja',
      link: newNotif.action_url || newNotif.actionUrl || null
    };

    setNotifications((prev) => [formatted, ...prev.filter((n) => n.id !== formatted.id)]);
  });

  const filtered = notifications.filter(
    (n) => filterType === 'ALL' || n.type === filterType
  );

  const markAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await apiClient.post(`/student/notifications/${id}/read`);
    } catch (err) {
      console.warn('Mark read request error:', err);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await apiClient.post('/student/notifications/read-all');
    } catch (err) {
      console.warn('Mark all read request error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Pusat Pemberitahuan Siswa
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Informasi terkini mengenai pendaftaran, jadwal kelas, absensi, status izin, dan pengumuman lembaga.
          </p>
        </div>

        <button
          type="button"
          onClick={markAllRead}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-primary)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Tandai Semua Dibaca
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          paddingBottom: '0.5rem'
        }}
      >
        {[
          { key: 'ALL', label: 'Semua' },
          { key: 'pendaftaran', label: 'Pendaftaran' },
          { key: 'jadwal', label: 'Jadwal' },
          { key: 'absensi', label: 'Absensi' },
          { key: 'izin', label: 'Izin' },
          { key: 'pengumuman', label: 'Pengumuman' }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterType(tab.key)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: filterType === tab.key ? 700 : 500,
              backgroundColor: filterType === tab.key ? 'var(--vermilion)' : 'var(--surface-muted)',
              color: filterType === tab.key ? '#FFFFFF' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filtered.length === 0 ? (
          <div className="student-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Bell size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Tidak Ada Pemberitahuan
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Tidak ada notifikasi dalam kategori ini saat ini.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const Icon = item.icon || Bell;
            return (
              <div
                key={item.id}
                className="student-card"
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  borderLeft: item.isRead ? '1px solid var(--border-subtle)' : '4px solid var(--vermilion)',
                  backgroundColor: 'var(--surface)'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: item.isRead ? 'var(--surface-muted)' : 'var(--vermilion-subtle)',
                    color: item.isRead ? 'var(--text-secondary)' : 'var(--vermilion)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={20} />
                </div>

                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--surface-muted)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {item.category}
                      </span>
                      <h2 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {item.title}
                      </h2>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.createdAt}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0 0 0.65rem 0', lineHeight: 1.4 }}>
                    {item.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    {item.link && (
                      <Link
                        to={item.link}
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: 'var(--vermilion)',
                          textDecoration: 'none'
                        }}
                      >
                        Buka Rincian Menu &rarr;
                      </Link>
                    )}

                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => markAsRead(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0
                        }}
                      >
                        Tandai sudah dibaca
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
