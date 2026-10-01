import React from 'react';
import { ShieldCheck, HeartHandshake, Compass, Target, GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';
import SectionHeading from '../../components/common/SectionHeading';
import CTASection from '../../components/common/CTASection';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { BRAND } from '../../config/brand';

export default function AboutPage() {
  const senseiTeam = [
    {
      name: "Yamada Kenji Sensei",
      role: "Direktur Akademik & Penutur Asli (Native Instructor)",
      origin: "Yokohama, Jepang",
      experience: "14 Tahun Pengajaran Bahasa Asing & Pelatihan Lintas Budaya",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Rina Puspita, S.Hum.",
      role: "Kepala Kurikulum & Spesialis JLPT N1",
      origin: "Alumni Sastra Jepang & Mantan Penerjemah Korporasi Tokyo",
      experience: "9 Tahun Pengajar Utama JLPT & Persiapan JFT-Basic",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
    },
    {
      name: "Budi Santoso, S.T.",
      role: "Instruktur Teknis Tokutei Ginou & Pembina Mentalitas 5S",
      origin: "Mantan Praktisi Manufaktur di Prefektur Aichi Selama 5 Tahun",
      experience: "8 Tahun Bimbingan Teknis & Wawancara Perusahaan Jepang",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Ketepatan Standar Mutu (Tettei)",
      desc: "Kami tidak mengajarkan hafalan instan semata, melainkan pembiasaan struktur tata bahasa yang presisi dan pemahaman mendalam atas tata krama komunikasi bahasa Jepang."
    },
    {
      icon: HeartHandshake,
      title: "Pendekatan Humanis & Empati (Omoiyari)",
      desc: "Setiap siswa memiliki latar belakang dan kecepatan belajar yang berbeda. Sistem evaluasi kami personal, membimbing siswa dari ragu menjadi percaya diri."
    },
    {
      icon: Compass,
      title: "Integritas & Transparansi Tanpa Kompromi",
      desc: "Seluruh informasi terkait biaya, persyaratan dokumen, hingga kondisi nyata lingkungan kerja di Jepang disampaikan secara terbuka tanpa iming-iming manipulatif."
    }
  ];

  return (
    <div>
      {/* Top Editorial Hero */}
      <section className="section-py" style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="split-about">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span style={{ fontFamily: 'var(--font-jp)', color: 'var(--vermilion)', fontWeight: 700, fontSize: '0.9rem' }}>
                  学院について
                </span>
                <span style={{ width: '16px', height: '1px', backgroundColor: 'var(--border-strong)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
                  TENTANG LEMBAGA
                </span>
              </div>

              <h1 style={{ lineHeight: 1.2, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                Membangun Jembatan Integritas Antara Generasi Muda Indonesia dan Dunia Kerja Jepang.
              </h1>

              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                {BRAND.name} didirikan dengan satu komitmen luhur: menghadirkan pendidikan bahasa Jepang bermartabat yang tidak hanya berorientasi pada kelulusan ujian, melainkan ketangguhan adaptasi hidup dan kemajuan karier sejati di Jepang.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Button to="/programs" variant="primary" icon={ArrowRight}>
                  Jelajahi Program Pelatihan
                </Button>
                <Button to="/contact" variant="outline">
                  Hubungi Kantor Kami
                </Button>
              </div>
            </div>

            {/* Right Supporting Visual */}
            <div style={{ position: 'relative' }}>
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80"
                alt={`Suasana Pendidikan ${BRAND.name}`}
                style={{
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-card)',
                  width: '100%',
                  height: '460px',
                  objectFit: 'cover'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-1.5rem',
                  left: '1.5rem',
                  backgroundColor: 'var(--bg-surface)',
                  padding: '1.25rem 1.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-card)',
                  maxWidth: '320px'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--vermilion)', textTransform: 'uppercase' }}>
                  Akreditasi Kemnaker RI
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Izin Resmi LPK Terdaftar No. Kep. 542/LATTAS/2023
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Educational Philosophy */}
      <section className="section-py" style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="教育理念"
            categoryTag="FILOSOFI PENDIDIKAN"
            title="Tiga Nilai Inti dalam Setiap Langkah Bimbingan Kami"
            subtitle="Kami meyakini bahwa penguasaan bahasa tanpa pemahaman budaya adalah kelemahan, dan impian tanpa kedisiplinan adalah ilusi."
            alignment="center"
          />

          <div className="grid-3" style={{ marginTop: '3rem' }}>
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="card-editorial"
                  style={{ padding: '2.25rem', backgroundColor: 'var(--bg-canvas)' }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      backgroundColor: 'var(--vermilion-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--vermilion)',
                      marginBottom: '1.25rem'
                    }}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    {val.title}
                  </h3>

                  <p style={{ fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sensei & Instructional Leadership Team */}
      <section className="section-py" style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="講師陣紹介"
            categoryTag="TIM PENGAJAR"
            title="Dibimbing Langsung oleh Praktisi Berpengalaman & Native Sensei"
            subtitle="Para sensei kami mengombinasikan ketepatan tata bahasa murni dengan pengalaman riil industri korporasi Jepang."
          />

          <div className="grid-3">
            {senseiTeam.map((sens, idx) => (
              <div key={idx} className="card-editorial" style={{ padding: 0, overflow: 'hidden' }}>
                <img
                  src={sens.image}
                  alt={sens.name}
                  style={{ width: '100%', height: '240px', objectFit: 'cover' }}
                />
                <div style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                    {sens.name}
                  </h3>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--vermilion)', marginBottom: '0.75rem' }}>
                    {sens.role}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {sens.origin}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {sens.experience}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection />
    </div>
  );
}
