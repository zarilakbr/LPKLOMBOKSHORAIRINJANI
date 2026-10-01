import React from 'react';

export default function StatusBadge({ status = '' }) {
  const norm = status.toUpperCase();

  let bg = '#F1F5F9';
  let color = '#475569';
  let border = '#E2E8F0';

  // Green / Active / Open / Registered / Completed
  if (['ACTIVE', 'OPEN', 'REGISTERED', 'COMPLETED', 'PUBLISHED'].includes(norm)) {
    bg = '#ECFDF5';
    color = '#059669';
    border = '#A7F3D0';
  }
  // Blue / Info / Consultation / Ongoing
  else if (['CONSULTATION', 'ONGOING', 'TRAINING', 'SUPER_ADMIN'].includes(norm)) {
    bg = '#EFF6FF';
    color = '#2563EB';
    border = '#BFDBFE';
  }
  // Yellow / Ochre / Upcoming / Contacted / Admin
  else if (['CONTACTED', 'UPCOMING', 'ADMIN', 'DRAFT'].includes(norm)) {
    bg = '#FEF3C7';
    color = '#B45309';
    border = '#FDE68A';
  }
  // Purple / New / Staff
  else if (['NEW', 'STAFF'].includes(norm)) {
    bg = '#F5F3FF';
    color = '#7C3AED';
    border = '#DDD6FE';
  }
  // Red / Full / Inactive / Rejected / Closed
  else if (['FULL', 'INACTIVE', 'REJECTED', 'CLOSED', 'ARCHIVED'].includes(norm)) {
    bg = '#FFF1F2';
    color = '#E11D48';
    border = '#FECDD3';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.65rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        lineHeight: 1
      }}
    >
      {status}
    </span>
  );
}
