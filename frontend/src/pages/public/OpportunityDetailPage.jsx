import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Banknote, Languages, Calendar, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, BriefcaseBusiness } from 'lucide-react';
import { opportunityService } from '../../services/dataService';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CTASection from '../../components/common/CTASection';

export default function OpportunityDetailPage() {
  const { slug } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    opportunityService.getBySlug(slug).then((data) => {
      setOpportunity(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Memuat detail peluang karier...</p>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Peluang Karier Tidak Ditemukan</h2>
        <p style={{ marginBottom: '2rem' }}>Posisi sektor kerja yang Anda cari belum dibuka atau masa pendaftaran telah berakhir.</p>
        <Button to="/opportunities" variant="primary" icon={ArrowLeft} iconPosition="left">
          Kembali ke Peluang Karier
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumbs & Header Bar */}
      <section style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)', padding: '2rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)' }}>Beranda</Link>
            <span>/</span>
            <Link to="/opportunities" style={{ color: 'var(--text-secondary)' }}>Peluang Karier</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{opportunity.title}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <Badge variant="vermilion">{opportunity.sector}</Badge>
            <Badge variant="emerald">{opportunity.status === 'OPEN' ? 'Perekrutan Aktif' : opportunity.status}</Badge>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', lineHeight: 1.2, marginBottom: '1.25rem' }}>
            {opportunity.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={17} color="var(--vermilion)" />
              <span>Lokasi Penempatan: <strong>{opportunity.location}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Banknote size={17} color="var(--emerald)" />
              <span>Estimasi Gaji: <strong>{opportunity.salaryRange}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Details Body */}
      <section className="section-py" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '3.5rem', alignItems: 'flex-start' }} className="opp-split">
            {/* Left Content */}
            <div>
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '2.5rem' }}>
                <img
                  src={opportunity.image}
                  alt={opportunity.title}
                  style={{ width: '100%', height: '360px', objectFit: 'cover' }}
                />
              </div>

              <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Gambaran Bidang & Lingkungan Kerja</h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
                {opportunity.description}
              </p>

              {/* Requirements List */}
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.25rem' }}>Kriteria & Persyaratan Pelamar</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2.5rem' }}>
                {opportunity.requirements.map((req, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <CheckCircle2 size={18} color="var(--vermilion)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{req}</span>
                  </div>
                ))}
              </div>

              {/* Benefits */}
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.25rem' }}>Hak & Fasilitas Selama di Jepang</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', backgroundColor: 'var(--bg-canvas)', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                {opportunity.benefits.map((ben, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <ShieldCheck size={18} color="var(--emerald)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ben}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Summary Card */}
            <div style={{ position: 'sticky', top: '100px' }}>
              <div
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--vermilion)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Jalur Visa Kerja Resmi
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                  Tokutei Ginou 1 (SSW)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                    <Languages size={17} color="var(--vermilion)" />
                    <span><strong>Syarat Bahasa:</strong> {opportunity.languageReq}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                    <Calendar size={17} color="var(--vermilion)" />
                    <span><strong>Batasan Usia:</strong> {opportunity.ageReq}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                    <Banknote size={17} color="var(--emerald)" />
                    <span><strong>Penghasilan:</strong> {opportunity.salaryRange}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Button
                    to={`/register?goal=${encodeURIComponent(opportunity.title)}`}
                    variant="primary"
                    size="lg"
                    icon={ArrowRight}
                  >
                    Daftar Persiapan Sektor Ini
                  </Button>
                  <Button
                    to="/contact"
                    variant="outline"
                    size="md"
                  >
                    Konsultasi Persyaratan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .opp-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
