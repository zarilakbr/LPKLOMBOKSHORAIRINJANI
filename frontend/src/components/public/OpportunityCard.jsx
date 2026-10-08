import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Languages, ArrowRight, Banknote, BriefcaseBusiness } from 'lucide-react';
import Badge from '../common/Badge';

export default function OpportunityCard({ opportunity }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(opportunity.image && !imgError);

  return (
    <div className="card-editorial" style={{ height: '100%', padding: 0, overflow: 'hidden' }}>
      {/* Top Image Cover */}
      <div style={{ position: 'relative', height: '190px', backgroundColor: '#F1F5F9', overflow: 'hidden' }}>
        {hasImage ? (
          <img
            src={opportunity.image}
            alt={opportunity.title}
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
            <BriefcaseBusiness size={36} color="var(--vermilion, #E11D48)" opacity={0.85} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#CBD5E1' }}>
              LPK Lombok Shorai Rinjani
            </span>
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, transparent 60%)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
          <Badge variant="emerald">
            {opportunity.status === 'OPEN' ? 'Perekrutan Dibuka' : opportunity.status}
          </Badge>
        </div>

        <div style={{ position: 'absolute', bottom: '0.85rem', left: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FFFFFF', fontSize: '0.82rem' }}>
          <MapPin size={14} color="#FDA4AF" />
          <span>{opportunity.location}</span>
        </div>
      </div>

      {/* Body Content */}
      <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--vermilion)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          {opportunity.sector}
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.3 }}>
          <Link to={`/opportunities/${opportunity.slug}`} style={{ color: 'var(--text-primary)' }}>
            {opportunity.title}
          </Link>
        </h3>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', flexGrow: 1 }}>
          {opportunity.description.slice(0, 130)}...
        </p>

        {/* Feature Highlights */}
        <div
          style={{
            backgroundColor: 'var(--bg-canvas)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
            marginBottom: '1.5rem',
            fontSize: '0.82rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Banknote size={16} color="var(--emerald)" />
            <span><strong>Estimasi:</strong> {opportunity.salaryRange}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Languages size={16} color="var(--vermilion)" />
            <span><strong>Bahasa:</strong> {opportunity.languageReq}</span>
          </div>
        </div>

        {/* Action Link */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
          <Link
            to={`/opportunities/${opportunity.slug}`}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <span>Rincian Persyaratan</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
