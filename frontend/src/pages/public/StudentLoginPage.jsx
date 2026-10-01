import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  GraduationCap,
  Presentation,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Info
} from 'lucide-react';
import { authService } from '../../services/dataService';
import Button from '../../components/common/Button';
import JapaneseAuthBackground from '../../components/common/JapaneseAuthBackground';
import { BRAND } from '../../config/brand';

export default function StudentLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('portal') === 'admin' ? 'ADMIN' : searchParams.get('portal') === 'teacher' ? 'PENGAJAR' : 'SISWA';

  // Selected portal tab is purely an intention selector, NOT an authorization grant
  const [selectedRole, setSelectedRole] = useState(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    { key: 'SISWA', label: 'Siswa', icon: GraduationCap, defaultEmail: 'siswa@lombokshorairinjani.co.id' },
    { key: 'PENGAJAR', label: 'Pengajar', icon: Presentation, defaultEmail: 'pengajar@lombokshorairinjani.co.id' },
    { key: 'ADMIN', label: 'Admin', icon: ShieldCheck, defaultEmail: 'admin@lombokshorairinjani.co.id' }
  ];

  const handleSelectRole = (roleKey) => {
    setSelectedRole(roleKey);
    setError('');
    setNotice('');
  };

  const handleFillDemo = (roleKey) => {
    const opt = roleOptions.find((r) => r.key === roleKey);
    if (opt) {
      setSelectedRole(roleKey);
      setEmail(opt.defaultEmail);
      setPassword('password123');
      setError('');
      setNotice('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      // Pass selected portal to auth service. The backend determines the real authenticated role.
      const result = await authService.login(email, password, selectedRole);

      // Role Security: Check if authenticated role matches user's selected portal
      if (result.role !== selectedRole) {
        setNotice(
          `Akun Anda terdaftar sebagai ${result.role}. Mengalihkan Anda secara otomatis ke dashboard resmi yang sesuai...`
        );
        setTimeout(() => {
          navigate(result.redirectUrl);
        }, 1200);
      } else {
        navigate(result.redirectUrl);
      }
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: 'calc(100vh - var(--header-height, 76px))',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1rem, 3vw, 1.5rem)',
        overflow: 'hidden'
      }}
    >
      {/* 100% Vector Japanese SVG Background - Pure Vector, Zero Raster Image */}
      <JapaneseAuthBackground />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden'
        }}
      >
        {/* Card Header */}
        <div
          style={{
            padding: '2rem 1.75rem 1.5rem 1.75rem',
            textAlign: 'center',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <img
            src={BRAND.logo}
            alt={BRAND.name}
            style={{
              width: '48px',
              height: '48px',
              objectFit: 'contain',
              borderRadius: '50%',
              margin: '0 auto 0.75rem auto',
              display: 'block'
            }}
          />

          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
            Masuk Portal Lembaga
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
            {BRAND.name}
          </p>
        </div>

        {/* 3-Role Selector: Masuk sebagai */}
        <div style={{ padding: '1rem clamp(1rem, 4vw, 1.75rem) 0.5rem clamp(1rem, 4vw, 1.75rem)' }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
            Masuk sebagai:
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.35rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {roleOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = selectedRole === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSelectRole(opt.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    padding: '0.6rem 0.25rem',
                    borderRadius: 'calc(var(--radius-sm) - 2px)',
                    fontSize: 'clamp(0.74rem, 2.8vw, 0.86rem)',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--vermilion)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                    boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                    border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    minWidth: 0,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={15} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fast Demo Credentials Helper */}
        <div
          style={{
            margin: '0.75rem clamp(1rem, 4vw, 1.75rem) 0 clamp(1rem, 4vw, 1.75rem)',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>Demo Akun {selectedRole}:</span>
          <button
            type="button"
            onClick={() => handleFillDemo(selectedRole)}
            style={{
              color: 'var(--vermilion)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            Isi Kredensial
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem clamp(1rem, 4vw, 1.75rem) 2rem clamp(1rem, 4vw, 1.75rem)' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#DC2626',
                fontSize: '0.84rem',
                marginBottom: '1rem',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#2563EB',
                fontSize: '0.84rem',
                marginBottom: '1rem',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
            >
              <Info size={17} style={{ flexShrink: 0 }} />
              <span>{notice}</span>
            </div>
          )}

          <div style={{ marginBottom: '1.15rem' }}>
            <label
              htmlFor="login-email"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.35rem'
              }}
            >
              Alamat Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.4rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-strong)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="login-password"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.35rem'
              }}
            >
              Kata Sandi
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.4rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-strong)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={ArrowRight}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Memverifikasi...' : `Masuk sebagai ${selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()}`}
          </Button>

          {selectedRole === 'SISWA' && (
            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                textAlign: 'center',
                fontSize: '0.86rem',
                color: 'var(--text-secondary)'
              }}
            >
              Belum memiliki akun siswa?{' '}
              <Link
                to="/register"
                style={{
                  color: 'var(--vermilion)',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Daftar Sekarang
              </Link>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
