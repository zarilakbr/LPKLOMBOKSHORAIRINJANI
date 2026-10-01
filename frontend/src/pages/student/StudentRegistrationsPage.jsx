import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { studentAuthService } from '../../services/dataService';
import Button from '../../components/common/Button';

export default function StudentRegistrationsPage() {
  const currentStudent = studentAuthService.getCurrentUser() || { id: 101, name: 'Ahmad Fajar Pratama' };
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Isolated student access: only load registrations belonging to this student's userId
    studentAuthService.getMyRegistrations(currentStudent.id).then((data) => {
      setRegistrations(data);
      setLoading(false);
    });
  }, [currentStudent.id]);

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACCEPTED':
      case 'COMPLETED':
      case 'REGISTERED':
        return { label: 'Diterima / Terdaftar', bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)' };
      case 'CONTACTED':
      case 'CONSULTATION':
      case 'REVIEWED':
        return { label: 'Sedang Ditinjau', bg: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' };
      case 'REJECTED':
        return { label: 'Dibatalkan', bg: 'rgba(239, 68, 68, 0.15)', color: '#DC2626' };
      default:
        return { label: 'Menunggu Verifikasi', bg: 'rgba(245, 158, 11, 0.15)', color: '#D97706' };
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Pendaftaran Saya
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            Riwayat pendaftaran program pelatihan dan seleksi karier yang terhubung ke akun Anda.
          </p>
        </div>

        <Button to="/programs" variant="outline" size="sm" icon={ArrowRight}>
          Jelajahi Program Lain
        </Button>
      </div>

      {loading ? (
        <div className="student-card" style={{ textAlign: 'center', padding: '3rem' }}>
          Memuat data pendaftaran...
        </div>
      ) : registrations.length === 0 ? (
        <div className="student-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <FileText size={42} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Belum Ada Pendaftaran Aktif
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Anda belum mengajukan pendaftaran program. Pilih program pelatihan untuk memulai karier di Jepang.
          </p>
          <Button to="/programs" variant="primary" size="md">
            Pilih Program Pelatihan
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {registrations.map((reg) => {
            const badge = getStatusBadge(reg.status);
            return (
              <div key={reg.id} className="student-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      KODE PENDAFTARAN: {reg.registrationCode}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {reg.programInterest}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: badge.bg,
                      color: badge.color,
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}
                  >
                    {badge.label}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem', padding: '1rem', backgroundColor: 'var(--surface-muted)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.76rem' }}>Tanggal Pengajuan:</span>
                    <strong>{reg.createdAt || '1 Oktober 2026'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.76rem' }}>Level Kemampuan:</span>
                    <strong>{reg.japaneseLevel || 'Nol / Dasar'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.76rem' }}>Target Karier:</span>
                    <strong>{reg.japanGoal || 'Tokutei Ginou'}</strong>
                  </div>
                </div>

                {reg.adminNotes && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '0.75rem 1rem', borderLeft: '3px solid var(--vermilion)', backgroundColor: 'var(--surface)' }}>
                    <strong>Catatan Tim Akademik:</strong> {reg.adminNotes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
