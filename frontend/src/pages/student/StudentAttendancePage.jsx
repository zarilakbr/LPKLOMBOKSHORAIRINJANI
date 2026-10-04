import React, { useState, useEffect, useCallback } from 'react';
import { CalendarCheck, Calendar, Clock, AlertCircle, CheckCircle, Clock4, XCircle, FilePlus, Filter, X } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import { apiClient } from '../../services/apiClient';
import { useRealtimeEvent, useRealtime } from '../../context/RealtimeContext';

export default function StudentAttendancePage() {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeClass, setActiveClass] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const { onReconnect } = useRealtime();

  // Load real student class and attendance records
  const loadAttendanceData = useCallback(async () => {
    try {
      const [classRes, attRes] = await Promise.allSettled([
        apiClient.get('/student/classes'),
        apiClient.get('/student/attendance')
      ]);

      if (classRes.status === 'fulfilled' && classRes.value.data?.success) {
        const classes = classRes.value.data.data || [];
        setActiveClass(classes[0] || null);
      }

      if (attRes.status === 'fulfilled' && attRes.value.data?.success) {
        const items = attRes.value.data.data || [];
        setAttendanceHistory(items);
      }
    } catch (err) {
      console.warn('Failed to load attendance records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);

  // Auto-resync when reconnecting
  useEffect(() => {
    return onReconnect(() => {
      loadAttendanceData();
    });
  }, [onReconnect, loadAttendanceData]);

  // REALTIME EVENT LISTENERS (Instant reactive update without page reload)
  useRealtimeEvent('attendance.recorded', (data) => {
    setAttendanceHistory((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === data.id);
      const newRecord = {
        id: data.id,
        attendance_date: data.attendanceDate || new Date().toISOString().split('T')[0],
        status: data.status,
        check_in_time: data.checkInTime || new Date().toTimeString().slice(0, 5),
        notes: data.notes || '',
        class_name: data.className || activeClass?.class_name || 'Kelas Pelatihan'
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], ...newRecord };
        return copy;
      }
      return [newRecord, ...prev];
    });

    setFeedback({
      type: 'success',
      message: `Presensi tanggal ${data.attendanceDate || 'hari ini'} telah dicatat sebagai ${data.status.toUpperCase()} secara realtime.`
    });
  });

  useRealtimeEvent('attendance.updated', (data) => {
    setAttendanceHistory((prev) =>
      prev.map((item) => (item.id === data.id ? { ...item, status: data.status, notes: data.notes || item.notes } : item))
    );
    setFeedback({
      type: 'info',
      message: `Presensi tanggal ${data.attendanceDate || 'hari ini'} telah diperbarui menjadi ${data.status.toUpperCase()} oleh Pengajar.`
    });
  });

  // Calculate dynamic stats from real database items
  const summary = attendanceHistory.reduce(
    (acc, item) => {
      acc.total += 1;
      const st = (item.status || '').toLowerCase();
      if (st === 'hadir') acc.hadir += 1;
      else if (st === 'terlambat') acc.terlambat += 1;
      else if (st === 'izin') acc.izin += 1;
      else if (st === 'sakit') acc.sakit += 1;
      else if (st === 'alpa') acc.alpa += 1;
      return acc;
    },
    { total: 0, hadir: 0, terlambat: 0, izin: 0, sakit: 0, alpa: 0 }
  );

  const today = new Date();
  const todayDateStr = today.toISOString().split('T')[0];
  const todayFormatted = today.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  // Today's attendance item
  const todayRecord = attendanceHistory.find((a) => (a.attendance_date || a.attendanceDate) === todayDateStr);
  const todayStatus = todayRecord ? todayRecord.status.toUpperCase() : 'BELUM_ABSEN';

  const filteredHistory = attendanceHistory.filter(
    (item) => filterStatus === 'ALL' || (item.status || '').toUpperCase() === filterStatus
  );

  // Check-in action via official API
  const handleAbsen = async () => {
    if (!activeClass) {
      setFeedback({ type: 'error', message: 'Anda belum terdaftar dalam kelas pelatihan aktif.' });
      setShowConfirm(false);
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/student/attendance/check-in', {
        class_id: activeClass.id
      });

      if (res.data?.success && res.data.data) {
        const newRecord = res.data.data;
        setAttendanceHistory((prev) => [newRecord, ...prev.filter((i) => i.id !== newRecord.id)]);
        setFeedback({
          type: 'success',
          message: 'Presensi kehadiran hari ini berhasil dicatat secara resmi ke database.'
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal melakukan absensi. Pastikan Anda memiliki enrollment aktif.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="container-narrow">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Absensi Siswa
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Pantau kehadiran harian dan riwayat presensi kelas Anda secara realtime.
        </p>
      </div>

      {feedback && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            color: feedback.type === 'error' ? 'var(--vermilion)' : 'var(--emerald)',
            border: `1px solid ${feedback.type === 'error' ? 'var(--vermilion-border)' : 'rgba(16, 185, 129, 0.25)'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Absensi Hari Ini */}
      <div className="card-editorial" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <CalendarCheck size={20} style={{ color: 'var(--vermilion)' }} />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Absensi Hari Ini</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tanggal</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{todayFormatted}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Kelas Aktif</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {activeClass?.class_name || activeClass?.name || 'Belum Terdaftar Kelas'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status Kehadiran</div>
            {todayStatus === 'BELUM_ABSEN' ? (
              <span className="badge badge-navy">Belum Absen</span>
            ) : (
              <span className={`badge ${todayStatus === 'HADIR' ? 'badge-emerald' : 'badge-ochre'}`}>
                {todayStatus}
              </span>
            )}
          </div>
        </div>

        {todayStatus === 'BELUM_ABSEN' && (
          <button 
            className="btn btn-primary" 
            onClick={() => setShowConfirm(true)}
            style={{ width: '100%', maxWidth: '300px' }}
            disabled={!activeClass || submitting}
          >
            <CalendarCheck size={18} />
            <span>{submitting ? 'Memproses...' : 'Absen Sekarang'}</span>
          </button>
        )}
      </div>

      {/* Ringkasan Absensi Dinamis */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card-editorial" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{summary.total}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>TOTAL SESI</div>
        </div>
        <div className="card-editorial" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald)', lineHeight: 1 }}>{summary.hadir}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>HADIR</div>
        </div>
        <div className="card-editorial" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ochre)', lineHeight: 1 }}>{summary.terlambat}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>TERLAMBAT</div>
        </div>
        <div className="card-editorial" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3B82F6', lineHeight: 1 }}>{summary.izin + summary.sakit}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>IZIN / SAKIT</div>
        </div>
      </div>

      {/* Riwayat Absensi */}
      <div className="card-editorial" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-primary)' }}>Riwayat Kehadiran</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Daftar presensi terverifikasi oleh pengajar kelas.</p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['ALL', 'HADIR', 'TERLAMBAT', 'IZIN', 'SAKIT'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: filterStatus === st ? 700 : 500,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: filterStatus === st ? 'var(--vermilion)' : 'var(--border-subtle)',
                  backgroundColor: filterStatus === st ? 'var(--vermilion-subtle)' : 'transparent',
                  color: filterStatus === st ? 'var(--vermilion)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {st === 'ALL' ? 'Semua' : st}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Belum ada riwayat absensi yang tercatat.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Tanggal</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Kelas</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.attendance_date || item.attendanceDate}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                      {item.class_name || item.className || activeClass?.class_name || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`badge ${
                        (item.status || '').toUpperCase() === 'HADIR' ? 'badge-emerald' :
                        (item.status || '').toUpperCase() === 'TERLAMBAT' ? 'badge-ochre' : 'badge-navy'
                      }`}>
                        {(item.status || '').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {item.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <Modal
          isOpen={showConfirm}
          title="Konfirmasi Presensi Kehadiran"
          onClose={() => setShowConfirm(false)}
        >
          <div style={{ padding: '1rem 0' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Apakah Anda yakin ingin mengisi absensi kehadiran untuk kelas <strong>{activeClass?.class_name || activeClass?.name}</strong> pada tanggal <strong>{todayFormatted}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAbsen}
                disabled={submitting}
              >
                {submitting ? 'Menyimpan...' : 'Ya, Absen Sekarang'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
