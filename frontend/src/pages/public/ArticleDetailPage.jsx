import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CalendarDays, Clock, User, ArrowLeft, Tag, Share2, BookOpen } from 'lucide-react';
import { articleService } from '../../services/dataService';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CTASection from '../../components/common/CTASection';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setImgError(false);
    articleService.getBySlug(slug).then((data) => {
      setArticle(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Memuat isi artikel edukatif...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Artikel Tidak Ditemukan</h2>
        <p style={{ marginBottom: '2rem' }}>Artikel yang Anda tuju mungkin telah dipindahkan atau belum diterbitkan.</p>
        <Button to="/articles" variant="primary" icon={ArrowLeft} iconPosition="left">
          Kembali ke Indeks Artikel
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Top Editorial Breadcrumbs */}
      <section style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)', padding: '2.5rem 0' }}>
        <div className="container-narrow">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            <Link to="/" style={{ color: 'var(--text-secondary)' }}>Beranda</Link>
            <span>/</span>
            <Link to="/articles" style={{ color: 'var(--text-secondary)' }}>Artikel</Link>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{article.category}</span>
          </div>

          <Badge variant="vermilion" style={{ marginBottom: '1rem' }}>
            {article.category}
          </Badge>

          <h1 style={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)', lineHeight: 1.25, marginBottom: '1.25rem' }}>
            {article.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={15} color="var(--vermilion)" />
              <span>{article.author}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CalendarDays size={15} color="var(--vermilion)" />
              <span>{article.publishedDate}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={15} color="var(--vermilion)" />
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Reading View */}
      <section className="section-py" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="container-narrow">
          {/* Cover Image */}
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '3rem', boxShadow: 'var(--shadow-card)', backgroundColor: '#0F172A' }}>
            {article.thumbnail && !imgError ? (
              <img
                src={article.thumbnail}
                alt={article.title}
                loading="lazy"
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '260px',
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
                <BookOpen size={48} color="var(--vermilion, #E11D48)" opacity={0.85} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#CBD5E1' }}>
                  LPK Lombok Shorai Rinjani • Artikel & Edukasi
                </span>
              </div>
            )}
          </div>

          {/* Excerpt Lead */}
          <div
            style={{
              fontSize: '1.2rem',
              lineHeight: 1.7,
              fontWeight: 500,
              color: 'var(--text-primary)',
              borderLeft: '4px solid var(--vermilion)',
              paddingLeft: '1.5rem',
              marginBottom: '2.5rem',
              fontStyle: 'italic'
            }}
          >
            {article.excerpt}
          </div>

          {/* Formatted Content Body */}
          <div
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.85,
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            {article.content.split('\n\n').map((paragraph, idx) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={idx} style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                    {trimmed.replace('## ', '')}
                  </h2>
                );
              }

              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={idx} style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '1.25rem', marginBottom: '0.5rem' }}>
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }

              return <p key={idx}>{trimmed}</p>;
            })}
          </div>

          {/* Tags */}
          <div style={{ marginTop: '3.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Tag size={16} color="var(--vermilion)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Topik Terkait:</span>
            {article.tags.map((t, idx) => (
              <span key={idx} style={{ padding: '0.25rem 0.65rem', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                #{t}
              </span>
            ))}
          </div>

          {/* Author Box */}
          <div
            style={{
              marginTop: '3rem',
              padding: '2rem',
              backgroundColor: 'var(--bg-canvas)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem'
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--vermilion-subtle)',
                color: 'var(--vermilion)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <User size={30} />
            </div>

            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Ditulis oleh {article.author}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, marginTop: '0.25rem' }}>
                Bagian dari tim edukasi dan penelitian kurikulum LPK Lombok Shorai Rinjani, berdedikasi menyajikan informasi akurat seputar studi dan karier di Jepang.
              </p>
            </div>
          </div>

          {/* Back link */}
          <div style={{ marginTop: '2.5rem' }}>
            <Button to="/articles" variant="outline" icon={ArrowLeft} iconPosition="left">
              Kembali ke Semua Artikel
            </Button>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
