import React from 'react';
import { ShieldCheck, HeartHandshake, Compass, Target, GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';
import SectionHeading from '../../components/common/SectionHeading';
import CTASection from '../../components/common/CTASection';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { BRAND } from '../../config/brand';

export default function AboutPage() {


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

          <div className="card-editorial" style={{ textAlign: 'center', padding: '3.5rem 2rem', backgroundColor: 'var(--bg-surface)' }}>
            <GraduationCap size={48} color="var(--vermilion)" style={{ margin: '0 auto 1.25rem auto' }} />
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Standar Kualifikasi Pengajar
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 1.5rem auto', lineHeight: 1.7 }}>
              Seluruh sensei dan instruktur di {BRAND.name} melalui seleksi ketat dengan sertifikasi resmi JLPT (N1/N2) serta pengalaman langsung tinggal dan bekerja di Jepang. Informasi profil instruktur per angkatan akan diperbarui menjelang pembukaan kelas.
            </p>
            <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} color="var(--emerald)" />
              <span>Profil resmi instruktur akan diperbarui sesuai penugasan kelas berjalan.</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection />
    </div>
  );
}
