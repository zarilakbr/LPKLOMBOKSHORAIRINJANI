import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import Button from '../../components/common/Button';

export default function NotFoundPage() {
  return (
    <div
      style={{
        padding: '8rem 1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      <div className="container-narrow">
        <div style={{ fontFamily: 'var(--font-jp)', fontSize: '1rem', color: 'var(--vermilion)', fontWeight: 700, marginBottom: '0.5rem' }}>
          ページが見つかりません
        </div>
        <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Halaman Tidak Ditemukan
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 2.5rem auto', lineHeight: 1.7 }}>
          Halaman yang Anda cari mungkin telah dipindahkan, diubah namanya, atau sementara tidak tersedia.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Button to="/" variant="primary" icon={Home} iconPosition="left">
            Kembali ke Beranda
          </Button>
          <Button to="/programs" variant="outline">
            Jelajahi Program
          </Button>
        </div>
      </div>
    </div>
  );
}
