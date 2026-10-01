import React from 'react';

export default function Badge({ children, variant = 'vermilion', icon: Icon, className = '' }) {
  const variantClass = {
    vermilion: 'badge-vermilion',
    navy: 'badge-navy',
    ochre: 'badge-ochre',
    emerald: 'badge-emerald'
  }[variant] || 'badge-vermilion';

  return (
    <span className={`badge ${variantClass} ${className}`}>
      {Icon && <Icon size={12} strokeWidth={2.5} />}
      <span>{children}</span>
    </span>
  );
}
