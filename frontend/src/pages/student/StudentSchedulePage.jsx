import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, RefreshCw, User, Sparkles, Filter, AlertCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { useRealtimeEvent, useRealtime } from '../../context/RealtimeContext';

export default function StudentSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { onReconnect } = useRealtime();

  // Load student's active classes for filter
  const loadClasses = useCallback(async () => {
    try {
      const res = await apiClient.get('/student/classes');
      if (res.data?.success) {
        setClasses(res.data.data || []);
      }
    } catch (err) {
      console.warn('Failed to load enrolled classes:', err);
    }
  }, []);

  // Load real schedules from API
  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedClassId !== 'ALL') params.class_id = selectedClassId;
      if (selectedDate) params.date = selectedDate;

      const res = await apiClient.get('/student/schedule', { params });
      if (res.data?.success) {
        setSchedules(res.data.data || []);
      }
    } catch (err) {
      console.warn('Failed to load schedule:', err);
      setError('Gagal memuat jadwal belajar. Pastikan Anda terhubung ke internet.');
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, selectedDate]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  useEffect(() => {
    return onReconnect(() => {
      loadClasses();
      loadSchedule();
    });
  }, [onReconnect, loadClasses, loadSchedule]);

  // Realtime updates: update schedule live on schedule events
  useRealtimeEvent('schedule.created', () => {
    loadSchedule();
  });

  useRealtimeEvent('schedule.updated', () => {
    loadSchedule();
  });

  useRealtimeEvent('schedule.deleted', () => {
    loadSchedule();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Header Banner */}
      <div
        className="student-card"
        style={{
          borderLeft: '4px solid var(--ochre, #B45309)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--ochre, #B45309)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            <Sparkles size={14} />
            <span>AGENDA & WAKTU BELAJAR</span>
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            Jadwal Pelatihan Saya
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
            Jadwal sesi kelas tatap muka, simulasi lab bahasa, dan pembekalan materi ajar untuk kelas aktif Anda.
          </p>
        </div>

        <button
          onClick={loadSchedule}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.85rem',
            borderRadius: '6px',
            border: '1px solid var(--border, #E5E7EB)',
            backgroundColor: 'var(--surface, #FFF)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Segarkan
        </button>
      </div>

      {/* 2. Filter Bar */}
      <div
        className="student-card"
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          padding: '1rem 1.25rem'
        }}
      >
        {/* Class Filter */}
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #6B7280)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            Pilih Kelas
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border, #E5E7EB)',
              fontSize: '0.88rem',
              backgroundColor: 'var(--surface, #FFF)'
            }}
          >
            <option value="ALL">Semua Kelas Aktif ({classes.length})</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.className || cls.class_name || cls.name || `Kelas #${cls.id}`}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ flex: '1 1 180px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted, #6B7280)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            Filter Tanggal
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border, #E5E7EB)',
              fontSize: '0.88rem',
              backgroundColor: 'var(--surface, #FFF)'
            }}
          />
        </div>
      </div>

      {/* 3. Schedule Content */}
      {loading ? (
        <div className="student-card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <RefreshCw size={26} className="spin" style={{ margin: '0 auto 0.75rem auto' }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Memuat jadwal sesi kelas...</p>
        </div>
      ) : error ? (
        <div className="student-card" style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
          <AlertCircle size={28} style={{ margin: '0 auto 0.5rem auto' }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>{error}</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="student-card" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Calendar size={40} style={{ color: 'var(--text-muted, #9CA3AF)', margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
            Tidak Ada Jadwal Belajar
          </h3>
          <p style={{ fontSize: '0.85rem', margin: 0, maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
            {selectedDate || selectedClassId !== 'ALL'
              ? 'Tidak ditemukan jadwal untuk filter yang dipilih. Silakan atur ulang tanggal atau kelas.'
              : 'Belum ada agenda kelas aktif yang dijadwalkan saat ini. Sesi kelas baru akan muncul otomatis.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {schedules.map((item, idx) => (
            <div
              key={item.id || item.classId || idx}
              className="student-card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                borderLeft: '3px solid var(--ochre, #B45309)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--ochre, #B45309)', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <Calendar size={15} />
                  <span>{item.date || item.schedule || 'Jadwal Reguler'}</span>
                  {item.startTime && item.endTime && (
                    <>
                      <span>•</span>
                      <Clock size={15} />
                      <span>{item.startTime} – {item.endTime} WITA</span>
                    </>
                  )}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
                  {item.title || item.className || 'Sesi Pelatihan'}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} color="var(--text-muted)" />
                    <span>{item.location || 'Ruang Dojo Rinjani'}</span>
                  </div>
                  {item.teacherName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={14} color="var(--text-muted)" />
                      <span>Sensei: <strong>{item.teacherName}</strong></span>
                    </div>
                  )}
                  {item.instructor && !item.teacherName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={14} color="var(--text-muted)" />
                      <span>Sensei: <strong>{item.instructor}</strong></span>
                    </div>
                  )}
                </div>

                {item.notes && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Catatan: {item.notes}
                  </div>
                )}
              </div>

              {item.status && (
                <span
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: item.status === 'SCHEDULED' || item.status === 'OPEN' ? '#DEF7EC' : '#F3F4F6',
                    color: item.status === 'SCHEDULED' || item.status === 'OPEN' ? '#03543F' : '#4B5563'
                  }}
                >
                  {item.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
