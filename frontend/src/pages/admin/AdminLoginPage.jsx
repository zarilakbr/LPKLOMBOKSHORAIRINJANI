import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/dataService';
import Button from '../../components/common/Button';
import JapaneseAuthBackground from '../../components/common/JapaneseAuthBackground';
import { BRAND } from '../../config/brand';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@lombokshorairinjani.co.id');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(email, password, 'ADMIN');
      navigate(result.redirectUrl || '/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 100% Vector Japanese SVG Background */}
      <JapaneseAuthBackground />

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Top Header Card */}
        <div
          style={{
            backgroundColor: '#1E293B',
            padding: '2.5rem 2rem 2rem 2rem',
            textAlign: 'center',
            color: '#FFFFFF',
            borderBottom: '1px solid #334155'
          }}
        >
          <img
            src={BRAND.logo}
            alt={BRAND.name}
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'contain',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              padding: '3px',
              margin: '0 auto 1rem auto',
              display: 'block'
            }}
          />

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', margin: '0.25rem 0' }}>
            {BRAND.name}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
            Panel Pengelolaan Data & Pendaftaran Siswa
          </p>
        </div>

        {/* Development Auth Notice */}
        <div
          style={{
            backgroundColor: '#FEF3C7',
            padding: '0.85rem 1.5rem',
            borderBottom: '1px solid #FDE68A',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.78rem',
            color: '#92400E'
          }}
        >
          <ShieldAlert size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Mode Pengembangan:</strong> Kredensial telah terisi otomatis untuk pengujian simulasi login.
          </span>
        </div>

        {/* Form Body */}
        <div style={{ padding: '2rem' }}>
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#FEE2E2',
                border: '1px solid #FECDD3',
                borderRadius: 'var(--radius-sm)',
                color: '#DC2626',
                fontSize: '0.85rem',
                marginBottom: '1.25rem'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Alamat Email Admin
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex' }}>
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="admin@lombokshorairinjani.co.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Kata Sandi
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '0.85rem', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex' }}>
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
            <a href="/" style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
              &larr; Kembali ke Website Publik
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
