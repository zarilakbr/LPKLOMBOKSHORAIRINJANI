import React from 'react';

export default function SectionHeading({
  jpSubtitle,
  categoryTag,
  title,
  subtitle,
  alignment = 'left',
  isDark = false,
  action,
  className = ''
}) {
  const isCenter = alignment === 'center';

  return (
    <div
      className={`section-heading ${className}`}
      style={{
        marginBottom: '3rem',
        textAlign: isCenter ? 'center' : 'left',
        maxWidth: isCenter ? '800px' : '100%',
        marginLeft: isCenter ? 'auto' : 0,
        marginRight: isCenter ? 'auto' : 0
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          justifyContent: isCenter ? 'center' : 'flex-start',
          marginBottom: '0.75rem'
        }}
      >
        {jpSubtitle && (
          <span
            style={{
              fontFamily: 'var(--font-jp)',
              fontSize: '0.85rem',
              color: isDark ? '#FDA4AF' : 'var(--vermilion)',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}
          >
            {jpSubtitle}
          </span>
        )}
        {jpSubtitle && categoryTag && (
          <span
            style={{
              width: '16px',
              height: '1px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'var(--border-strong)'
            }}
          />
        )}
        {categoryTag && (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: isDark ? '#94A3B8' : 'var(--text-secondary)'
            }}
          >
            {categoryTag}
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: isCenter ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isCenter ? 'center' : 'flex-end',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ maxWidth: action ? '750px' : '100%' }}>
          <h2
            style={{
              color: isDark ? 'var(--text-on-dark)' : 'var(--text-primary)',
              lineHeight: 1.25,
              marginBottom: subtitle ? '1rem' : 0
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                color: isDark ? 'var(--text-on-dark-muted)' : 'var(--text-secondary)',
                fontSize: '1.05rem',
                lineHeight: 1.65,
                margin: 0
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
