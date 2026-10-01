import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Cari data...', onClear }) {
  return (
    <div style={{ position: 'relative', minWidth: '260px' }}>
      <div style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex' }}>
        <Search size={16} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.65rem 2.2rem 0.65rem 2.5rem',
          fontSize: '0.88rem',
          backgroundColor: '#FFFFFF',
          border: '1px solid #CBD5E1',
          borderRadius: 'var(--radius-sm)',
          outline: 'none',
          color: '#1E293B'
        }}
      />
      {value && (
        <button
          onClick={onClear || (() => onChange(''))}
          style={{
            position: 'absolute',
            top: '50%',
            right: '0.75rem',
            transform: 'translateY(-50%)',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          type="button"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
