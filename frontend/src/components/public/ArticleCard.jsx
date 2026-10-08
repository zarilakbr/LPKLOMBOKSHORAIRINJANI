import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, ArrowRight, BookOpen } from 'lucide-react';
import Badge from '../common/Badge';

export default function ArticleCard({ article }) {
  const [imgError, setImgError] = useState(false);
  const hasThumbnail = Boolean(article.thumbnail && !imgError);

  return (
    <article
      className="card-editorial"
      style={{
        padding: 0,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ position: 'relative', height: '210px', overflow: 'hidden', backgroundColor: '#F1F5F9' }}>
        {hasThumbnail ? (
          <img
            src={article.thumbnail}
            alt={article.title}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              color: '#94A3B8',
              gap: '0.5rem'
            }}
          >
            <BookOpen size={36} color="var(--vermilion, #E11D48)" opacity={0.85} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#CBD5E1' }}>
              LPK Lombok Shorai Rinjani
            </span>
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.6) 0%, transparent 60%)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
          <Badge variant="vermilion">
            {article.category}
          </Badge>
        </div>
      </div>

      <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CalendarDays size={13} />
            <span>{article.publishedDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={13} />
            <span>{article.readTime}</span>
          </div>
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.35, marginBottom: '0.85rem' }}>
          <Link to={`/articles/${article.slug}`} style={{ color: 'var(--text-primary)' }}>
            {article.title}
          </Link>
        </h3>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', flexGrow: 1 }}>
          {article.excerpt}
        </p>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Oleh: {article.author}
          </span>

          <Link
            to={`/articles/${article.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--vermilion)'
            }}
          >
            <span>Baca</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
