import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

export default function FilterDropdown({ value, onChange, options = [], label = 'Filter' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            appearance: 'none',
            padding: '0.65rem 2rem 0.65rem 2.2rem',
            fontSize: '0.88rem',
            fontWeight: 500,
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: 'var(--radius-sm)',
            color: '#1E293B',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div style={{ position: 'absolute', top: '50%', left: '0.75rem', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none', display: 'flex' }}>
          <SlidersHorizontal size={14} />
        </div>
      </div>
    </div>
  );
}
