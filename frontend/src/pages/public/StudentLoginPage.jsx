import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  GraduationCap,
  Presentation,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  LogIn,
  UserPlus,
  AlertCircle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { authService } from '../../services/dataService';
import Button from '../../components/common/Button';
import JapaneseAuthBackground from '../../components/common/JapaneseAuthBackground';
import TurnstileWidget from '../../components/common/TurnstileWidget';
import { BRAND } from '../../config/brand';

/**
 * Clean Inline Google Brand Icon
 */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

export default function StudentLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Determine initial mode (LOGIN or REGISTER) based on route or query
  const isRegisterInitial =
    location.pathname === '/register' ||
    searchParams.get('mode') === 'register' ||
    searchParams.get('tab') === 'register';

  const [authMode, setAuthMode] = useState(isRegisterInitial ? 'REGISTER' : 'LOGIN');

  // Role selector for Login testing (Authority is always verified by backend)
  const defaultPortal =
    searchParams.get('portal') === 'admin'
      ? 'ADMIN'
      : searchParams.get('portal') === 'teacher'
      ? 'PENGAJAR'
      : 'SISWA';
  const [selectedRole, setSelectedRole] = useState(defaultPortal);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('SISWA');

  // Human Verification (Cloudflare Turnstile)
  const [turnstileToken, setTurnstileToken] = useState('');

  // Feedback states
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Sync mode if pathname changes
  useEffect(() => {
    if (location.pathname === '/register') {
      setAuthMode('REGISTER');
    } else if (location.pathname === '/login') {
      setAuthMode('LOGIN');
    }
  }, [location.pathname]);

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
      setLoginEmail(opt.defaultEmail);
      setLoginPassword('password123');
      setError('');
      setNotice('');
    }
  };

  // Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const result = await authService.login(loginEmail, loginPassword, selectedRole, turnstileToken);

      // Backend is true authority for verified role
      if (result.role && result.role !== selectedRole) {
        setNotice(
          `Akun Anda terdaftar sebagai ${result.role}. Mengalihkan Anda secara otomatis ke dashboard resmi...`
        );
        setTimeout(() => {
          navigate(result.redirectUrl);
        }, 1000);
      } else {
        navigate(result.redirectUrl || '/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  // Register Submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (regPassword.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.register({
        fullName: regFullName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        role: regRole,
        turnstileToken
      });

      setNotice(
        result.message ||
        `Pendaftaran ${regRole === 'PENGAJAR' ? 'Pengajar (Sensei)' : 'Siswa'} berhasil diserahkan! Akun Anda sedang menunggu verifikasi dan persetujuan Administrator sebelum dapat digunakan untuk masuk.`
      );
      setRegFullName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Handler (Backend validation required)
  const handleGoogleLogin = async () => {
    setError('');
    setNotice('');
    setGoogleLoading(true);

    try {
      const authUrl = await authService.getGoogleOAuthUrl();
      if (typeof window !== 'undefined' && authUrl) {
        window.location.href = authUrl;
      }
    } catch (err) {
      // Safe, clear error message when Google OAuth is not configured in backend
      setError(
        err.message ||
        'Layanan Google OAuth belum dikonfigurasi pada server backend. Silakan gunakan email dan kata sandi Anda.'
      );
    } finally {
      setGoogleLoading(false);
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
        padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 1.5rem)',
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
          backgroundColor: 'var(--bg-surface, #FFFFFF)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden'
        }}
      >
        {/* Card Header with Official Logo & Brand */}
        <div
          style={{
            padding: '1.75rem 1.5rem 1.25rem 1.5rem',
            textAlign: 'center',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <img
            src={BRAND.logo}
            alt={BRAND.name}
            style={{
              width: '46px',
              height: '46px',
              objectFit: 'contain',
              borderRadius: '50%',
              margin: '0 auto 0.65rem auto',
              display: 'block'
            }}
          />

          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            {BRAND.name}
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
            {authMode === 'LOGIN' ? 'Masuk ke Portal Lembaga' : 'Daftar Akun Siswa Baru'}
          </p>

          {/* Unified Mode Switcher Tab (Masuk / Daftar) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.35rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              padding: '0.3rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              marginTop: '1.25rem'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode('LOGIN');
                setError('');
                setNotice('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.55rem',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                fontSize: '0.88rem',
                fontWeight: authMode === 'LOGIN' ? 700 : 500,
                color: authMode === 'LOGIN' ? 'var(--vermilion)' : 'var(--text-secondary)',
                backgroundColor: authMode === 'LOGIN' ? 'var(--bg-surface)' : 'transparent',
                boxShadow: authMode === 'LOGIN' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                border: authMode === 'LOGIN' ? '1px solid var(--border-subtle)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <LogIn size={15} />
              <span>Masuk</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('REGISTER');
                setError('');
                setNotice('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.55rem',
                borderRadius: 'calc(var(--radius-sm) - 2px)',
                fontSize: '0.88rem',
                fontWeight: authMode === 'REGISTER' ? 700 : 500,
                color: authMode === 'REGISTER' ? 'var(--vermilion)' : 'var(--text-secondary)',
                backgroundColor: authMode === 'REGISTER' ? 'var(--bg-surface)' : 'transparent',
                boxShadow: authMode === 'REGISTER' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                border: authMode === 'REGISTER' ? '1px solid var(--border-subtle)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <UserPlus size={15} />
              <span>Daftar Akun</span>
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNERS */}
        <div style={{ padding: '1rem clamp(1rem, 4vw, 1.75rem) 0 clamp(1rem, 4vw, 1.75rem)' }}>
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
                marginBottom: '0.75rem',
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
                marginBottom: '0.75rem',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
            >
              <Info size={17} style={{ flexShrink: 0 }} />
              <span>{notice}</span>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* MODE A: LOGIN FLOW                                       */}
        {/* ========================================================= */}
        {authMode === 'LOGIN' && (
          <div>
            {/* 3-Role Portal Selector: Siswa, Pengajar, Admin */}
            <div style={{ padding: '0.5rem clamp(1rem, 4vw, 1.75rem) 0.25rem clamp(1rem, 4vw, 1.75rem)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Masuk sebagai:
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.35rem',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  padding: '0.3rem',
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
                        padding: '0.55rem 0.25rem',
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
                      <Icon size={14} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fast Demo Credentials Helper for Testing */}
            <div
              style={{
                margin: '0.65rem clamp(1rem, 4vw, 1.75rem) 0 clamp(1rem, 4vw, 1.75rem)',
                padding: '0.55rem 0.75rem',
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
                  padding: 0,
                  background: 'none',
                  border: 'none'
                }}
              >
                Isi Kredensial
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} style={{ padding: '1rem clamp(1rem, 4vw, 1.75rem) 1.75rem clamp(1rem, 4vw, 1.75rem)' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="login-email"
                  style={{
                    display: 'block',
                    fontSize: '0.84rem',
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
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@email.com"
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem 0.7rem 2.3rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-strong)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Mail
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '0.8rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="login-password"
                  style={{
                    display: 'block',
                    fontSize: '0.84rem',
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem 0.7rem 2.3rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-strong)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '0.8rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                </div>
              </div>

              {/* Cloudflare Turnstile Human Verification */}
              <TurnstileWidget
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken('')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={LogIn}
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              >
                {loading ? 'Memverifikasi...' : `Masuk sebagai ${selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()}`}
              </Button>

              {/* Google OAuth Option */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '1.25rem 0',
                  gap: '0.75rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                <span>atau</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  padding: '0.7rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-strong)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <GoogleIcon />
                <span>{googleLoading ? 'Menghubungkan ke Google...' : 'Masuk dengan Google'}</span>
              </button>

              {/* Toggle to Register */}
              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1.15rem',
                  borderTop: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}
              >
                Belum memiliki akun siswa?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('REGISTER');
                    setError('');
                    setNotice('');
                  }}
                  style={{
                    color: 'var(--vermilion)',
                    fontWeight: 700,
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Daftar Sekarang
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE B: REGISTER FLOW                                    */}
        {/* ========================================================= */}
        {authMode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} style={{ padding: '1rem clamp(1rem, 4vw, 1.75rem) 1.75rem clamp(1rem, 4vw, 1.75rem)' }}>
            {/* Role selector for registration: SISWA vs PENGAJAR only */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.45rem' }}>
                Mendaftar sebagai:
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  padding: '0.3rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setRegRole('SISWA')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 0.5rem',
                    borderRadius: 'calc(var(--radius-sm) - 2px)',
                    fontSize: '0.85rem',
                    fontWeight: regRole === 'SISWA' ? 700 : 500,
                    color: regRole === 'SISWA' ? 'var(--vermilion)' : 'var(--text-secondary)',
                    backgroundColor: regRole === 'SISWA' ? 'var(--bg-surface)' : 'transparent',
                    boxShadow: regRole === 'SISWA' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                    border: regRole === 'SISWA' ? '1px solid var(--border-subtle)' : '1px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  <GraduationCap size={16} />
                  <span>Siswa (Peserta)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('PENGAJAR')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 0.5rem',
                    borderRadius: 'calc(var(--radius-sm) - 2px)',
                    fontSize: '0.85rem',
                    fontWeight: regRole === 'PENGAJAR' ? 700 : 500,
                    color: regRole === 'PENGAJAR' ? 'var(--vermilion)' : 'var(--text-secondary)',
                    backgroundColor: regRole === 'PENGAJAR' ? 'var(--bg-surface)' : 'transparent',
                    boxShadow: regRole === 'PENGAJAR' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                    border: regRole === 'PENGAJAR' ? '1px solid var(--border-subtle)' : '1px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  <Presentation size={16} />
                  <span>Pengajar (Sensei)</span>
                </button>
              </div>
              <div style={{ marginTop: '0.45rem', fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {regRole === 'PENGAJAR'
                  ? 'Pendaftaran sebagai Tenaga Instruktur / Sensei. Akun memerlukan verifikasi & persetujuan Admin sebelum dapat masuk ke Teacher Dashboard.'
                  : 'Pendaftaran sebagai Calon Siswa Pelatihan Kerja ke Jepang. Akun memerlukan verifikasi & persetujuan Admin sebelum dapat masuk ke Student Dashboard.'}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="reg-name"
                style={{
                  display: 'block',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem'
                }}
              >
                Nama Lengkap *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Nama sesuai KTP"
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem 0.7rem 2.3rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-strong)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <User
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '0.8rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="reg-email"
                style={{
                  display: 'block',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem'
                }}
              >
                Alamat Email *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="contoh@gmail.com"
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem 0.7rem 2.3rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-strong)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <Mail
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '0.8rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="reg-phone"
                style={{
                  display: 'block',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem'
                }}
              >
                No. WhatsApp / HP *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem 0.7rem 2.3rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-strong)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <Phone
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '0.8rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '0.85rem', marginBottom: '1.15rem' }}>
              <div>
                <label
                  htmlFor="reg-password"
                  style={{
                    display: 'block',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.35rem'
                  }}
                >
                  Kata Sandi *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.8rem 0.7rem 2.2rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-strong)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock
                    size={14}
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-confirm-password"
                  style={{
                    display: 'block',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.35rem'
                  }}
                >
                  Ulangi Sandi *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-confirm-password"
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.8rem 0.7rem 2.2rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-strong)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock
                    size={14}
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Cloudflare Turnstile Human Verification */}
            <TurnstileWidget
              onVerify={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken('')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={UserPlus}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {loading ? 'Memproses Pendaftaran...' : (regRole === 'PENGAJAR' ? 'Daftar sebagai Pengajar' : 'Daftar sebagai Siswa')}
            </Button>

            {/* Google OAuth Option */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '1.25rem 0',
                gap: '0.75rem',
                color: 'var(--text-muted)',
                fontSize: '0.8rem'
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span>atau</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                padding: '0.7rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-strong)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                fontWeight: 650,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
            >
              <GoogleIcon />
              <span>{googleLoading ? 'Menghubungkan ke Google...' : 'Daftar dengan Google'}</span>
            </button>

            {/* Toggle to Login */}
            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.15rem',
                borderTop: '1px solid var(--border-subtle)',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}
            >
              Sudah memiliki akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('LOGIN');
                  setError('');
                  setNotice('');
                }}
                style={{
                  color: 'var(--vermilion)',
                  fontWeight: 700,
                  textDecoration: 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Masuk ke Akun Anda
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
