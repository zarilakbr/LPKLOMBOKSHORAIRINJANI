import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  PhoneCall,
  Sparkles,
  AlertCircle,
  GraduationCap,
  CalendarCheck,
  FileCheck,
  Bell
} from 'lucide-react';
import { studentAuthService } from '../../services/dataService';
import { BRAND } from '../../config/brand';
import Button from '../../components/common/Button';

export default function StudentDashboardPage() {
  const currentStudent = studentAuthService.getCurrentUser() || {
    id: 101,
    name: 'Ahmad Fajar Pratama',
    email: 'ahmad.fajar@example.test',
    role: 'USER'
  };

  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAuthService.getMyRegistrations(currentStudent.id).then((regs) => {
      setMyRegistrations(regs);
      setLoading(false);
    });
  }, [currentStudent.id]);

  const activeReg = myRegistrations[0] || null;

  return (
    <div>
      {/* Welcome Hero Banner */}
      <div
        className="student-card"
        style={{
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)',
          borderLeft: '4px solid var(--vermilion)',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--vermilion)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            <Sparkles size={14} />
            <span>PORTAL SISWA RESMI</span>
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
            Selamat Datang, {currentStudent.name}!
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '620px' }}>
            Pantau status seleksi berkas, verifikasi dokumen, dan jadwal kelas pelatihan bahasa Jepang Anda di {BRAND.name}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Button to="/dashboard/attendance" variant="primary" size="sm" icon={CalendarCheck}>
            Absen Sekarang
          </Button>
          <Button to="/dashboard/permission" variant="outline" size="sm" icon={FileCheck} style={{ backgroundColor: 'transparent' }}>
            Ajukan Izin
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem'
        }}
      >
        <div className="student-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status Pendaftaran</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {activeReg ? activeReg.status.toUpperCase() : 'PENDING'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Kode: {activeReg ? activeReg.registrationCode : 'Belum Ada'}
          </div>
        </div>

        <div className="student-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Absensi Hari Ini</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--emerald-subtle)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarCheck size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Belum Absen
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            <Link to="/dashboard/attendance" style={{ color: 'var(--vermilion)', textDecoration: 'none', fontWeight: 600 }}>Absen sekarang &rarr;</Link>
          </div>
        </div>

        <div className="student-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Jadwal Berikutnya</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--ochre-subtle)', color: 'var(--ochre)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Bahasa Jepang N4
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Besok, 08:00 WITA
          </div>
        </div>

        <div className="student-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Pemberitahuan</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-surface-subtle)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            0 Baru
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            <Link to="/dashboard/notifications" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Lihat semua</Link>
          </div>
        </div>
      </div>

      {/* Detail Timeline & WhatsApp Counselor */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
        {/* Registration Detail Card */}
        <div className="student-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Alur Seleksi & Kelulusan Anda
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <CheckCircle2 size={20} color="var(--emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  1. Akun Siswa Dibuat
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Akun Anda telah aktif dan terdaftar di database sistem.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <Clock size={20} color="var(--vermilion)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  2. Verifikasi Berkas & Wawancara Minat
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Tim konsultan akademik sedang meninjau data Anda.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', opacity: 0.6 }}>
              <Clock size={20} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  3. Penempatan Kelas & Pembagian Modul
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Masuk angkatan kelas intensif dan bimbingan sensei.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Counselor Contact Card */}
        <div className="student-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Bantuan & Konseling Siswa
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Memerlukan bantuan pengisian dokumen atau informasi jadwal ujian? Konselor siswa kami siap membantu Anda.
          </p>

          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-muted)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <PhoneCall size={20} color="var(--emerald)" />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Hotline Konsultasi Siswa:
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {BRAND.phone} (Senin - Sabtu: 08.00 - 17.00 WITA)
              </div>
            </div>
          </div>

          <Button
            href={BRAND.whatsappUrl}
            variant="outline"
            size="md"
            icon={PhoneCall}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Chat Konselor via WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
