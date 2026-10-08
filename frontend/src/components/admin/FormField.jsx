import React from 'react';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  options = [],
  placeholder = '',
  required = false,
  rows = 3,
  error,
  helpText
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.2rem' }}>
      {label && (
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
          {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            padding: '0.65rem 0.85rem',
            fontSize: '0.9rem',
            backgroundColor: '#FFFFFF',
            border: `1px solid ${error ? '#DC2626' : '#CBD5E1'}`,
            borderRadius: 'var(--radius-sm)',
            outline: 'none',
            color: '#1E293B'
          }}
        >
          {placeholder && (!options.length || (typeof options[0] === 'object' && options[0]?.value !== '')) && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt, idx) => {
            const val = typeof opt === 'object' && opt !== null ? (opt.value ?? opt.id ?? '') : opt;
            const lbl = typeof opt === 'object' && opt !== null 
              ? (opt.label ?? opt.name ?? opt.className ?? opt.class_name ?? opt.title ?? (opt.value !== undefined ? String(opt.value) : '')) 
              : opt;
            return (
              <option key={opt?.key || (val !== '' ? val : idx)} value={val}>
                {lbl || val || '-'}
              </option>
            );
          })}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          style={{
            width: '100%',
            padding: '0.65rem 0.85rem',
            fontSize: '0.9rem',
            backgroundColor: '#FFFFFF',
            border: `1px solid ${error ? '#DC2626' : '#CBD5E1'}`,
            borderRadius: 'var(--radius-sm)',
            outline: 'none',
            color: '#1E293B',
            resize: 'vertical'
          }}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.65rem 0.85rem',
            fontSize: '0.9rem',
            backgroundColor: '#FFFFFF',
            border: `1px solid ${error ? '#DC2626' : '#CBD5E1'}`,
            borderRadius: 'var(--radius-sm)',
            outline: 'none',
            color: '#1E293B'
          }}
        />
      )}

      {error && <span style={{ fontSize: '0.78rem', color: '#DC2626' }}>{error}</span>}
      {helpText && !error && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{helpText}</span>}
    </div>
  );
}
