import React from 'react';
import { ArrowRight, PhoneCall, ShieldCheck, CheckCircle } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import JapaneseAtmosphere from '../common/JapaneseAtmosphere';
import { mockSiteSettings } from '../../data/mockSiteSettings';

export default function Hero() {
  const { hero, stats } = mockSiteSettings;

  return (
    <section
      className="hero-section"
      style={{
        position: 'relative',
        minHeight: 'clamp(580px, 85vh, 860px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 'clamp(4.5rem, 8vw, 7rem)',
        paddingBottom: 'clamp(4.5rem, 8vw, 7rem)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Reusable Global Japanese Atmosphere System */}
      <JapaneseAtmosphere variant="hero" />

      {/* 4. Centered Hero Content */}
      <div
        className="container"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1200px',
          marginInline: 'auto'
        }}
      >
        <div
          style={{
            maxWidth: '860px',
            marginInline: 'auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* BADGE */}
          <div style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Badge variant="vermilion" icon={ShieldCheck}>
              {hero.badgeText || 'LEMBAGA RESMI PELATIHAN BAHASA & KARIER JEPANG'}
            </Badge>
          </div>

          {/* HEADLINE */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4.25rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em',
              textAlign: 'center'
            }}
          >
            {hero.titlePrimary || 'Mulai Langkahmu'}{' '}
            <br />
            <span style={{ color: 'var(--vermilion, #DC2626)' }}>
              {hero.titleHighlight || 'Menuju Jepang.'}
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p
            style={{
              fontSize: 'clamp(1.05rem, 1.8vw, 1.22rem)',
              lineHeight: 1.75,
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              marginInline: 'auto',
              marginBottom: '2.5rem',
              textAlign: 'center',
              fontWeight: 400
            }}
          >
            {hero.description}
          </p>

          {/* CTA BUTTONS */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '3rem',
              width: '100%'
            }}
          >
            <Button to="/programs" variant="primary" size="lg" icon={ArrowRight}>
              {hero.primaryCtaText || 'Jelajahi Program'}
            </Button>
            <Button
              href={mockSiteSettings.whatsappUrl}
              variant="outline"
              size="lg"
              icon={PhoneCall}
              iconPosition="left"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                borderColor: 'var(--text-primary)',
                backdropFilter: 'blur(8px)'
              }}
            >
              {hero.secondaryCtaText || 'Konsultasi via WhatsApp'}
            </Button>
          </div>

          {/* TRUST POINTS */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(1rem, 3vw, 2.25rem)',
              flexWrap: 'wrap',
              color: 'var(--text-primary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem', fontWeight: 600 }}>
              <CheckCircle size={18} color="var(--vermilion, #DC2626)" />
              <span>Terakreditasi Kemnaker RI</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem', fontWeight: 600 }}>
              <CheckCircle size={18} color="var(--vermilion, #DC2626)" />
              <span>Sensei Native & Bersertifikat N1/N2</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem', fontWeight: 600 }}>
              <CheckCircle size={18} color="var(--vermilion, #DC2626)" />
              <span>Bimbingan Karier Terpadu</span>
            </div>
          </div>
        </div>

        {/* BOTTOM STATS ROW (Clean & Spacious) */}
        {stats && stats.length > 0 && (
          <div
            style={{
              marginTop: '4rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.75rem',
              textAlign: 'center'
            }}
          >
            {stats.map((stat, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '1.25rem 1rem',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'var(--bg-surface)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span
                  style={{
                    fontSize: 'clamp(1.85rem, 3vw, 2.5rem)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: 1.1,
                    fontFamily: 'var(--font-sans)'
                  }}
                >
                  {stat.value}
                </span>
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                  {stat.label}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {stat.sublabel}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
