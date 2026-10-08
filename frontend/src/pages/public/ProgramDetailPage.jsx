import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, CalendarDays, Users, Award, CheckCircle2, ArrowRight, ArrowLeft, BookOpen, ShieldCheck, MessageCircle, GraduationCap } from 'lucide-react';
import { programService } from '../../services/dataService';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CTASection from '../../components/common/CTASection';

export default function ProgramDetailPage() {
  const { slug } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setImgError(false);
    programService.getBySlug(slug).then((data) => {
      setProgram(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Memuat rincian program kurikulum...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Program Tidak Ditemukan</h2>
        <p style={{ marginBottom: '2rem' }}>Program yang Anda tuju belum terdaftar atau telah diarsipkan.</p>
        <Button to="/programs" variant="primary" icon={ArrowLeft} iconPosition="left">
          Kembali ke Daftar Program
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header Breadcrumb Bar */}
      <section style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)', padding: '2rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)' }}>Beranda</Link>
            <span>/</span>
            <Link to="/programs" style={{ color: 'var(--text-secondary)' }}>Program</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{program.title}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <Badge variant="vermilion">{program.category}</Badge>
            <Badge variant="navy">{program.level}</Badge>
            {program.badge && <Badge variant="ochre">{program.badge}</Badge>}
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', lineHeight: 1.2, marginBottom: '1.25rem' }}>
            {program.title}
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '820px', lineHeight: 1.7 }}>
            {program.shortDescription}
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="section-py" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '3.5rem', alignItems: 'flex-start' }} className="program-detail-split">
            {/* Left Column: Full Description & Curriculum Syllabus */}
            <div>
              <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '2.5rem', backgroundColor: '#0F172A' }}>
                {program.image && !imgError ? (
                  <img
                    src={program.image}
                    alt={program.title}
                    loading="lazy"
                    onError={() => setImgError(true)}
                    style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '240px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                      color: '#94A3B8',
                      gap: '0.75rem',
                      padding: '2rem'
                    }}
                  >
                    <GraduationCap size={48} color="var(--vermilion, #E11D48)" opacity={0.85} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#CBD5E1' }}>
                      LPK Lombok Shorai Rinjani • Program Pelatihan
                    </span>
                  </div>
                )}
              </div>

              <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Deskripsi Menyeluruh Program</h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                {program.fullDescription}
              </p>

              {/* Curriculum Breakdown */}
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Silabus & Modul Pembelajaran</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
                {program.curriculum.map((mod, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1.5rem 1.75rem',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      borderLeft: '4px solid var(--vermilion)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--vermilion)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      {mod.module}
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      {mod.title}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {mod.desc}
                    </div>
                  </div>
                ))}
              </div>

              {/* Target Audience */}
              <div style={{ padding: '1.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={18} color="var(--vermilion)" />
                  <span>Target Peserta Program</span>
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {program.targetAudience}
                </p>
              </div>
            </div>

            {/* Right Column: Sticky Summary & Action Card */}
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
                  Biaya Pendidikan
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--emerald, #059669)', lineHeight: 1.2, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageCircle size={22} style={{ flexShrink: 0 }} />
                  <span>Via Konsultasi WhatsApp</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.9rem' }}>
                    <Clock size={18} color="var(--vermilion)" />
                    <span><strong>Durasi:</strong> {program.duration}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.9rem' }}>
                    <CalendarDays size={18} color="var(--vermilion)" />
                    <span><strong>Jadwal:</strong> {program.schedule}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.9rem' }}>
                    <ShieldCheck size={18} color="var(--vermilion)" />
                    <span><strong>Sertifikat:</strong> Terakreditasi Kemnaker</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Button
                    to={`/register?program=${encodeURIComponent(program.title)}`}
                    variant="primary"
                    size="lg"
                    icon={ArrowRight}
                  >
                    Daftar Kelas Ini
                  </Button>
                  <Button
                    to="/contact"
                    variant="outline"
                    size="md"
                  >
                    Konsultasi Program
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .program-detail-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
