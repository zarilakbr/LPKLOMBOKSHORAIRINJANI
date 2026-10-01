import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  Users,
  BookOpen,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Megaphone,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { authService, classService } from '../../services/dataService';
import { BRAND } from '../../config/brand';
import Button from '../../components/common/Button';

export default function TeacherDashboardPage() {
  const currentTeacher = authService.getCurrentUser() || {
    name: 'Sensei Kenjiro Tanaka, M.Ed.',
    role: 'PENGAJAR'
  };

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    classService.getAll().then((data) => {
      setClasses(data);
      setLoading(false);
    });
  }, []);

  const totalStudents = classes.reduce((sum, cls) => sum + (cls.enrolledCount || 0), 0);

  // Mock student highlights for teacher's active classes (Clearly identified as development data)
  const studentHighlights = [
    { id: 1, name: 'Ahmad Fajar Pratama', className: 'Batch 48 Reguler', target: 'JLPT N4', attendanceRate: '98%', status: 'Aktif' },
    { id: 2, name: 'Siti Nurhaliza', className: 'Batch 49 Intensif', target: 'JFT-Basic', attendanceRate: '100%', status: 'Aktif' },
    { id: 3, name: 'Rian Hidayat', className: 'Batch 08 Executive', target: 'Tokutei Ginou SSW', attendanceRate: '92%', status: 'Izin Disetujui' },
    { id: 4, name: 'Dewi Lestari', className: 'Batch 03 Kaigo', target: 'Kaigo Evaluation', attendanceRate: '95%', status: 'Aktif' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. WELCOME GREETING BANNER */}
      <div
        className="student-card"
        style={{
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)',
          borderLeft: '4px solid var(--ochre, #B45309)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--ochre, #B45309)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
            <Sparkles size={14} />
            <span>PORTAL AKADEMIK PENGAJAR (SENSEI)</span>
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
            Selamat Datang, {currentTeacher.name}!
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '640px' }}>
            Kelola jadwal kelas harian, presensi kehadiran siswa binaan, dan modul kurikulum bahasa Jepang di {BRAND.name}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Button to="/teacher/schedule" variant="primary" size="sm" icon={Calendar}>
            Jadwal Mengajar
          </Button>
          <Button to="/teacher/attendance" variant="outline" size="sm" icon={ClipboardCheck} style={{ backgroundColor: 'transparent' }}>
            Presensi Siswa
          </Button>
        </div>
      </div>

      {/* 2. RINGKASAN KELAS (METRICS) */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Ringkasan Kelas & Pembelajaran
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: '1.25rem'
          }}
        >
          <div className="student-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Kelas Binaan Aktif</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--ochre-subtle)', color: 'var(--ochre, #B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={17} />
              </div>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {classes.length > 0 ? `${classes.length} Angkatan` : '4 Angkatan'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              N5 Dasar, N4 Intensif, Kaigo & SSW
            </div>
          </div>

          <div className="student-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Siswa Binaan</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={17} />
              </div>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {totalStudents > 0 ? `${totalStudents} Siswa` : '68 Siswa'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--emerald)', marginTop: '0.35rem', fontWeight: 600 }}>
              Terdaftar di angkatan aktif
            </div>
          </div>

          <div className="student-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Rata-rata Presensi</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--emerald-subtle)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClipboardCheck size={17} />
              </div>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              96.8%
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Disiplin kehadiran tinggi
            </div>
          </div>

          <div className="student-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Modul Selesai</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--vermilion-subtle)', color: 'var(--vermilion)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={17} />
              </div>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              14 Bab Modul
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Kurikulum Minna no Nihongo & SSW
            </div>
          </div>
        </div>
      </div>

      {/* 3. JADWAL MENGAJAR BERIKUTNYA */}
      <div
        className="student-card"
        style={{
          borderLeft: '4px solid var(--vermilion)',
          backgroundColor: 'var(--surface)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--vermilion)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              <Clock size={14} />
              <span>SESI MENGAJAR BERIKUTNYA</span>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Bahasa Jepang N4 Intensif — Angkatan Batch 48
            </h2>
          </div>

          <Link
            to="/teacher/attendance"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--vermilion)',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            <ClipboardCheck size={14} />
            <span>Mulai Presensi Sesi</span>
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
            gap: '0.85rem',
            padding: '1rem',
            backgroundColor: 'var(--surface-muted)',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Waktu Kelas:</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>Hari Ini, 08:30 - 11:30 WITA</div>
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ruang Kelas:</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>Ruang Sakura 01 (Lantai 2)</div>
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Materi Pembahasan:</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>Bab 18: Bentuk Kamus (Jisho-kei) & Kaiwa</div>
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Peserta Terdaftar:</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>20 Siswa Aktif</div>
          </div>
        </div>
      </div>

      {/* 4. KELAS AKTIF BINAAN */}
      <div className="student-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Daftar Kelas Aktif yang Diampu
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Jadwal mingguan dan alokasi kapasitas ruang belajar
            </p>
          </div>
          <Link to="/teacher/classes" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ochre, #B45309)', textDecoration: 'none' }}>
            Lihat Semua Kelas &rarr;
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
          {classes.length > 0 ? (
            classes.slice(0, 3).map((cls) => (
              <div
                key={cls.id}
                style={{
                  padding: '1.1rem',
                  backgroundColor: 'var(--surface-muted)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ochre, #B45309)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    {cls.programTitle}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {cls.className}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Jadwal: {cls.schedule} • {cls.room}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>Kapasitas: <strong style={{ color: 'var(--text-primary)' }}>{cls.enrolledCount}/{cls.quota}</strong></span>
                  <Link to="/teacher/attendance" style={{ color: 'var(--vermilion)', fontWeight: 700, textDecoration: 'none' }}>
                    Presensi &rarr;
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Memuat daftar kelas aktif...
            </div>
          )}
        </div>
      </div>

      {/* 5. INFORMASI SISWA BINAAN */}
      <div className="student-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Informasi & Perkembangan Siswa Binaan
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Catatan kompetensi, tingkat presensi harian, dan target kelulusan ujian bahasa
            </p>
          </div>
          <Link to="/teacher/students" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ochre, #B45309)', textDecoration: 'none' }}>
            Data Siswa Lengkap &rarr;
          </Link>
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-muted)' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Nama Siswa</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Kelas Angkatan</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Target Ujian</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Tingkat Hadir</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.78rem', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {studentHighlights.map((st) => (
                <tr key={st.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {st.name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {st.className}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--ochre, #B45309)', fontWeight: 600 }}>
                    {st.target}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--emerald)', fontWeight: 700 }}>
                    {st.attendanceRate}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        backgroundColor: st.status === 'Aktif' ? 'var(--emerald-subtle)' : 'var(--ochre-subtle)',
                        color: st.status === 'Aktif' ? 'var(--emerald)' : 'var(--ochre, #B45309)'
                      }}
                    >
                      {st.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. PEMBERITAHUAN AKADEMIK PENGAJAR */}
      <div className="student-card" style={{ borderLeft: '4px solid var(--ochre, #B45309)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
          <Megaphone size={18} color="var(--ochre, #B45309)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Pemberitahuan & Pengumuman Akademik Sensei
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--surface-muted)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            <CheckCircle2 size={16} color="var(--emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Simulasi Ujian Mock JLPT N4 Dijadwalkan Sabtu Pagi
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Pengajar diharapkan menyiapkan lembar choukai audio di Lab Bahasa Lantai 1 paling lambat Jumat pukul 15.00 WITA.
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--surface-muted)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            <AlertCircle size={16} color="var(--ochre, #B45309)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Input Nilai Evaluasi Kemampuan Kanji & Kaiwa Pekan Ke-4
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Mohon segera mencatat skor formatif per sesi kelas agar kartu perkembangan belajar siswa dapat dicetak.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
