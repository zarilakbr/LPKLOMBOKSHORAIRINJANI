import React from 'react';
import { BookOpen, GraduationCap, Award, BriefcaseBusiness, Plane, CheckCircle2, Clock } from 'lucide-react';
import { mockJourney } from '../../data/mockJourney';

export default function JourneyTimeline() {
  const iconMap = {
    BookOpen: BookOpen,
    GraduationCap: GraduationCap,
    Award: Award,
    BriefcaseBusiness: BriefcaseBusiness,
    PlaneTakeoff: Plane
  };

  return (
    <div style={{ position: 'relative', marginTop: '3rem' }}>
      {/* Visual Connecting Spine on Desktop */}
      <div
        className="timeline-spine"
        style={{
          position: 'absolute',
          top: '30px',
          bottom: '30px',
          left: '32px',
          width: '2px',
          backgroundColor: 'var(--border-subtle)',
          zIndex: 1
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative', zIndex: 2 }}>
        {mockJourney.map((item, idx) => {
          const Icon = iconMap[item.iconName] || BookOpen;

          return (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr',
                gap: '2rem',
                alignItems: 'flex-start'
              }}
              className="journey-item-grid"
            >
              {/* Step Circle Marker */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '2px solid var(--vermilion)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-subtle)',
                  color: 'var(--vermilion)',
                  flexShrink: 0
                }}
              >
                <span style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1 }}>{item.step}</span>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, fontFamily: 'var(--font-jp)', marginTop: '2px' }}>
                  {item.kanji}
                </span>
              </div>

              {/* Main Content Box */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem 2.25rem',
                  boxShadow: 'var(--shadow-subtle)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                }}
                className="journey-box-hover"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--vermilion)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                      {item.tagline}
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {item.title}
                    </h3>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.75rem',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <Clock size={14} color="var(--vermilion)" />
                    <span>{item.duration}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  {item.description}
                </p>

                {/* Key Deliverables */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    borderLeft: '3px solid var(--vermilion)',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                    Capaian Kompetensi & Legalitas:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
                    {item.deliverables.map((deliv, dIdx) => (
                      <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <CheckCircle2 size={15} color="var(--emerald)" style={{ flexShrink: 0 }} />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .timeline-spine {
            display: none !important;
          }
          .journey-item-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
