import React, { useState } from 'react';
import { CalendarCheck, Calendar, Clock, AlertCircle, CheckCircle, Clock4, XCircle, FilePlus, Filter, X } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';

// MOCK DATA for development
const mockSummary = {
  total: 24,
  hadir: 20,
  terlambat: 2,
  izin: 1,
  sakit: 1,
  alpa: 0
};

const mockHistory = [
  { id: 1, date: '2026-10-01', time: '08:02', class: 'Bahasa Jepang N4 - Batch A', status: 'HADIR', note: '-' },
  { id: 2, date: '2026-09-30', time: '08:17', class: 'Bahasa Jepang N4 - Batch A', status: 'TERLAMBAT', note: 'Terlambat 17 menit' },
  { id: 3, date: '2026-09-29', time: '-', class: 'Bahasa Jepang N4 - Batch A', status: 'SAKIT', note: 'Bukti terlampir' },
  { id: 4, date: '2026-09-28', time: '07:55', class: 'Bahasa Jepang N4 - Batch A', status: 'HADIR', note: '-' },
  { id: 5, date: '2026-09-25', time: '-', class: 'Bahasa Jepang N4 - Batch A', status: 'IZIN', note: 'Keperluan keluarga' }
];

export default function StudentAttendancePage() {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showConfirm, setShowConfirm] = useState(false);
  const [todayStatus, setTodayStatus] = useState('BELUM_ABSEN');

  // Today's info mock
  const today = new Date();
  const todayFormatted = today.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const timeFormatted = today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const filteredHistory = mockHistory.filter(item => filterStatus === 'ALL' || item.status === filterStatus);

  const handleAbsen = () => {
    // Mock simulation
    setTodayStatus('HADIR');
    setShowConfirm(false);
  };

  return (
    <div className="container-narrow">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Absensi
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Kelola kehadiran dan lihat riwayat absensi Anda.
        </p>
      </div>

      {/* Development Banner */}
      <div style={{
        backgroundColor: 'var(--ochre-subtle)',
        border: '1px solid var(--ochre-border)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.85rem',
        color: 'var(--ochre)'
      }}>
        <AlertCircle size={16} />
        <span>Data saat ini berjalan pada mode <strong>Development (Mock)</strong>. Integrasi database akan dilakukan di tahap Backend.</span>
      </div>

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
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Jadwal Kelas</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Bahasa Jepang N4 - Batch A</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status Kehadiran</div>
            {todayStatus === 'BELUM_ABSEN' ? (
              <span className="badge badge-navy">Belum Absen</span>
            ) : (
              <span className="badge badge-emerald">Hadir</span>
            )}
          </div>
        </div>

        {todayStatus === 'BELUM_ABSEN' && (
          <button 
            className="btn btn-primary" 
            onClick={() => setShowConfirm(true)}
            style={{ width: '100%', maxWidth: '300px' }}
          >
            <CalendarCheck size={18} />
            <span>Absen Sekarang</span>
          </button>
        )}
      </div>

      {/* Ringkasan Absensi */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card-editorial" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{mockSummary.total}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>TOTAL SESI</div>
        </div>
        <div className="card-editorial" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald)', lineHeight: 1 }}>{mockSummary.hadir}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>HADIR</div>
        </div>
        <div className="card-editorial" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ochre)', lineHeight: 1 }}>{mockSummary.terlambat}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>TERLAMBAT</div>
        </div>
        <div className="card-editorial" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3B82F6', lineHeight: 1 }}>{mockSummary.izin + mockSummary.sakit}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>IZIN / SAKIT</div>
        </div>
      </div>

      {/* Riwayat Absensi */}
      <div className="card-editorial" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Riwayat Absensi</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select 
              className="form-select" 
              style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.85rem' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Semua Status</option>
              <option value="HADIR">Hadir</option>
              <option value="TERLAMBAT">Terlambat</option>
              <option value="IZIN">Izin</option>
              <option value="SAKIT">Sakit</option>
              <option value="ALPA">Alpa</option>
            </select>
          </div>
        </div>

        {/* Responsive List (Zero Horizontal Scroll for mobile) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Tidak ada data riwayat absensi.
            </div>
          ) : (
            filteredHistory.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                padding: '1rem',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-canvas)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.class}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> {item.date}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {item.time}</span>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                {item.note !== '-' && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                    <strong>Catatan:</strong> {item.note}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Konfirmasi Kehadiran"
        maxWidth="400px"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'flex-end' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setShowConfirm(false)}>
              Batalkan
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleAbsen}>
              Konfirmasi Absensi
            </button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tanggal</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{todayFormatted}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Kelas</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Bahasa Jepang N4 - Batch A</div>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Jam</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{timeFormatted}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Status</div>
              <span className="badge badge-emerald">Hadir</span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Pastikan Anda sudah berada di kelas sebelum menekan tombol konfirmasi absensi.
          </p>
        </div>
      </Modal>
    </div>
  );
}
