import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, ArrowRight } from 'lucide-react';
import Badge from '../common/Badge';

export default function ArticleCard({ article }) {
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
      <div style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
        <img
          src={article.thumbnail}
          alt={article.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.6) 0%, transparent 60%)'
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
