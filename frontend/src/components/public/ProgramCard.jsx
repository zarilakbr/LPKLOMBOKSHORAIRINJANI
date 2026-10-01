import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CalendarDays, ArrowRight, BookOpen } from 'lucide-react';
import Badge from '../common/Badge';

export default function ProgramCard({ program }) {
  return (
    <div className="card-editorial" style={{ height: '100%', padding: 0, overflow: 'hidden' }}>
      {/* Top Image Container */}
      <div style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
        <img
          src={program.image}
          alt={program.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          className="program-img-hover"
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.6) 0%, transparent 60%)'
          }}
        />

        {/* Level Tag */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
          <Badge variant="navy">
            {program.level}
          </Badge>
          {program.badge && (
            <Badge variant="vermilion">
              {program.badge}
            </Badge>
          )}
        </div>

        {/* Category Pill on bottom */}
        <div style={{ position: 'absolute', bottom: '0.85rem', left: '1rem', color: '#FFFFFF', fontSize: '0.78rem', fontWeight: 600 }}>
          {program.category}
        </div>
      </div>

      {/* Content Container */}
      <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.3 }}>
          <Link to={`/programs/${program.slug}`} style={{ color: 'var(--text-primary)', transition: 'color 0.2s' }}>
            {program.title}
          </Link>
        </h3>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', flexGrow: 1 }}>
          {program.shortDescription}
        </p>

        {/* Metadata row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={15} color="var(--vermilion)" />
            <span><strong>Durasi:</strong> {program.duration}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarDays size={15} color="var(--vermilion)" />
            <span><strong>Jadwal:</strong> {program.schedule}</span>
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Investasi Program</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {program.priceEstimate}
            </div>
          </div>

          <Link
            to={`/programs/${program.slug}`}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>Detail</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
