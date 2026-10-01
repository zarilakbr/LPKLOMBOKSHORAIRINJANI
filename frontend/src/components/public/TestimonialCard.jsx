import React from 'react';
import { MessageSquareQuote, MapPin, GraduationCap } from 'lucide-react';
import Badge from '../common/Badge';

export default function TestimonialCard({ testimonial }) {
  return (
    <div
      className="card-editorial"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '2.25rem',
        backgroundColor: 'var(--bg-surface)'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <MessageSquareQuote size={36} color="var(--vermilion)" style={{ opacity: 0.85 }} />
          <Badge variant="navy">
            {testimonial.badge}
          </Badge>
        </div>

        <blockquote
          style={{
            fontSize: '1rem',
            lineHeight: 1.75,
            color: 'var(--text-primary)',
            fontStyle: 'italic',
            marginBottom: '2rem'
          }}
        >
          "{testimonial.quote}"
        </blockquote>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-sm)',
            objectFit: 'cover',
            border: '1px solid var(--border-subtle)'
          }}
        />

        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {testimonial.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--vermilion)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
            <MapPin size={13} />
            <span>{testimonial.placement}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {testimonial.program} • {testimonial.year}
          </div>
        </div>
      </div>
    </div>
  );
}
