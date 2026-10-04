import React from 'react';
import { ArrowRight, PhoneCall, CheckCircle2, Sparkles } from 'lucide-react';
import Button from './Button';
import { mockSiteSettings } from '../../data/mockSiteSettings';
import { BRAND } from '../../config/brand';

export default function CTASection({
  title = `Wujudkan Langkah Nyata Menuju Jepang Bersama ${BRAND.name}`,
  subtitle = "Pendaftaran kelas intensif angkatan baru telah dibuka. Konsultasikan minat, kemampuan awal, serta sektor kerja impianmu bersama konsultan pendidikan kami.",
  showBenefits = true
}) {
  const benefits = [
    "Kurikulum Berbasis Standar Ujian JLPT & JFT-Basic",
    "Bimbingan Bersama Native Sensei & Pengajar Berpengalaman N1/N2",
    "Fasilitas Simulasi CBT Komputer & Studio Wawancara Resmi",
    "Pendampingan Job Matching & Legalisasi Dokumen ke Jepang"
  ];

  return (
    <section
      style={{
        backgroundColor: 'var(--bg-dark)',
        color: '#FFFFFF',
        position: 'relative'
      }}
      className="section-py"
    >
      {/* Editorial Decorative Japanese Grid Accent (scoped overflow) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '500px',
            height: '100%',
            opacity: 0.04,
            backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div
          style={{
            maxWidth: '880px',
            margin: '0 auto',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.9rem',
              backgroundColor: 'rgba(197, 48, 48, 0.2)',
              border: '1px solid rgba(197, 48, 48, 0.4)',
              borderRadius: 'var(--radius-full)',
              color: '#FDA4AF',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '1.5rem'
            }}
          >
            <Sparkles size={14} />
            <span>Pendaftaran Angkatan Baru Dibuka</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              color: '#FFFFFF',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '1.25rem'
            }}
          >
            {title}
          </h2>

          <p
            style={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: 'var(--text-on-dark-muted)',
              marginBottom: '2.5rem',
              maxWidth: '740px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            {subtitle}
          </p>

          {showBenefits && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                textAlign: 'left',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem 2rem',
                marginBottom: '2.5rem'
              }}
            >
              {benefits.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle2 size={16} color="var(--vermilion)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.88rem', color: '#E2E8F0' }}>{b}</span>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}
          >
            <Button to="/register" variant="primary" size="lg" icon={ArrowRight}>
              Daftar Program Sekarang
            </Button>
            <Button
              to={mockSiteSettings.whatsappUrl ? undefined : "/contact"}
              href={mockSiteSettings.whatsappUrl || undefined}
              variant="outline-white"
              size="lg"
              icon={PhoneCall}
              iconPosition="left"
            >
              Hubungi LPK
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
