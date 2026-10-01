import React from 'react';
import Badge from '../common/Badge';

export default function FacilityCard({ facility }) {
  return (
    <div
      className="card-editorial"
      style={{
        padding: 0,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
        <img
          src={facility.image}
          alt={facility.name}
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
          <Badge variant="navy">
            {facility.category}
          </Badge>
        </div>
      </div>

      <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          {facility.name}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          {facility.description}
        </p>
      </div>
    </div>
  );
}
