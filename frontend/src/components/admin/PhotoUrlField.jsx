import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, AlertCircle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';

export default function PhotoUrlField({
  label = 'URL Foto / Gambar',
  value = '',
  onChange,
  placeholder = 'https://images.unsplash.com/...',
  required = false,
  error,
  helpText,
  aspectRatio = '16/9',
  previewHeight = '140px',
  fallbackPlaceholder = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'
}) {
  const [imgStatus, setImgStatus] = useState('idle'); // 'idle' | 'loading' | 'loaded' | 'error'

  const isValidUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const hasValidUrl = isValidUrl(value?.trim());

  useEffect(() => {
    if (!value?.trim()) {
      setImgStatus('idle');
      return;
    }
    if (!hasValidUrl) {
      setImgStatus('error');
      return;
    }
    setImgStatus('loading');
    const img = new Image();
    img.src = value.trim();
    img.onload = () => setImgStatus('loaded');
    img.onerror = () => setImgStatus('error');
  }, [value, hasValidUrl]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
          {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
        </label>
        {value?.trim() && (
          <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {hasValidUrl && imgStatus === 'loaded' ? (
              <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <CheckCircle size={13} /> Link Valid & Tampil
              </span>
            ) : hasValidUrl && imgStatus === 'loading' ? (
              <span style={{ color: '#2563EB', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <RefreshCw size={13} className="spin-slow" /> Memuat...
              </span>
            ) : (
              <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <AlertCircle size={13} /> Link tidak dapat dimuat
              </span>
            )}
          </span>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.65rem 0.85rem',
            fontSize: '0.9rem',
            backgroundColor: '#FFFFFF',
            border: `1px solid ${error || (value?.trim() && !hasValidUrl) ? '#DC2626' : '#CBD5E1'}`,
            borderRadius: 'var(--radius-sm, 6px)',
            outline: 'none',
            color: '#1E293B',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Live Preview Container */}
      <div
        style={{
          marginTop: '0.35rem',
          borderRadius: 'var(--radius-sm, 6px)',
          border: '1px dashed #CBD5E1',
          backgroundColor: '#F8FAFC',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          minHeight: previewHeight,
          aspectRatio: aspectRatio
        }}
      >
        {hasValidUrl && imgStatus === 'loaded' ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={value.trim()}
              alt="Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                setImgStatus('error');
              }}
            />
            <a
              href={value.trim()}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: 'absolute',
                bottom: '0.5rem',
                right: '0.5rem',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                color: '#FFFFFF',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={12} /> Buka Asli
            </a>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#94A3B8' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.5rem auto',
                color: '#64748B'
              }}
            >
              <ImageIcon size={22} />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>
              {value?.trim() ? 'Gambar tidak dapat diakses / Link rusak' : 'Preview Foto / Gambar'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.15rem' }}>
              {value?.trim()
                ? 'Gunakan tautan gambar publik HTTPS yang valid'
                : 'Masukkan link gambar (URL) di atas untuk melihat preview langsung'}
            </div>
            {fallbackPlaceholder && !value?.trim() && (
              <button
                type="button"
                onClick={() => onChange(fallbackPlaceholder)}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.72rem',
                  borderRadius: '4px',
                  backgroundColor: '#EDF2F7',
                  border: '1px solid #CBD5E0',
                  color: '#4A5568',
                  cursor: 'pointer'
                }}
              >
                Gunakan Contoh Link
              </button>
            )}
          </div>
        )}
      </div>

      {error && <span style={{ fontSize: '0.78rem', color: '#DC2626' }}>{error}</span>}
      {helpText && !error && <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{helpText}</span>}
    </div>
  );
}
