import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, Phone, User, BookOpen, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { studentAuthService, programService } from '../../services/dataService';
import Button from '../../components/common/Button';
import JapaneseAuthBackground from '../../components/common/JapaneseAuthBackground';
import { BRAND } from '../../config/brand';

export default function StudentRegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedProgram = searchParams.get('program') || '';

  const [programsList, setProgramsList] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    programInterest: preSelectedProgram || 'Bahasa Jepang Dasar (N5)',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    programService.getAll().then((data) => setProgramsList(data));
  }, []);

  useEffect(() => {
    if (preSelectedProgram) {
      setFormData((prev) => ({ ...prev, programInterest: preSelectedProgram }));
    }
  }, [preSelectedProgram]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      await studentAuthService.register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        programInterest: formData.programInterest
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal. Silakan coba lagi.');
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
          maxWidth: '520px',
          backgroundColor: 'var(--bg-surface, var(--surface))',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '2rem clamp(1rem, 4vw, 2rem) 1.25rem clamp(1rem, 4vw, 2rem)',
            textAlign: 'center',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'var(--vermilion-subtle)',
              color: 'var(--vermilion)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem auto'
            }}
          >
            <UserPlus size={26} />
          </div>

          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.35rem 0' }}>
            Daftar Akun Siswa Baru
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
            Buat akun untuk mendaftar program dan mengakses Student Dashboard {BRAND.shortName}
          </p>
        </div>

        {/* Account Flow Stepper Notice */}
        <div
          style={{
            padding: '0.75rem clamp(0.75rem, 3vw, 1.5rem)',
            backgroundColor: 'var(--surface-muted)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontWeight: 700, color: 'var(--vermilion)' }}>1. Buat Akun</span>
          <span>→</span>
          <span>2. Verifikasi Data</span>
          <span>→</span>
          <span>3. Student Dashboard</span>
        </div>

        {success ? (
          <div style={{ padding: '3rem clamp(1rem, 4vw, 2rem)', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Akun Siswa Berhasil Dibuat!
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Selamat datang di LPK Lombok Shorai Rinjani. Anda dialihkan secara otomatis ke Student Dashboard...
            </p>
            <Button to="/dashboard" variant="primary" size="md">
              Buka Dashboard Siswa Sekarang
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem clamp(1rem, 4vw, 2rem) 2rem clamp(1rem, 4vw, 2rem)' }}>
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#DC2626',
                  fontSize: '0.84rem',
                  marginBottom: '1.25rem',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Nama Lengkap */}
            <div style={{ marginBottom: '1.15rem' }}>
              <label
                htmlFor="reg-fullname"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem'
                }}
              >
                Nama Lengkap Siswa *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-fullname"
                  type="text"
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Contoh: Muhammad Rizki"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <User
                  size={17}
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

            {/* Email & Phone Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', marginBottom: '1.15rem' }}>
              <div>
                <label
                  htmlFor="reg-email"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nama@email.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Mail
                    size={17}
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

              <div>
                <label
                  htmlFor="reg-phone"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.35rem'
                  }}
                >
                  Nomor WhatsApp *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="081234567890"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Phone
                    size={17}
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
            </div>

            {/* Program Interest Selection */}
            <div style={{ marginBottom: '1.15rem' }}>
              <label
                htmlFor="reg-program"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem'
                }}
              >
                Pilihan Minat Program Pelatihan
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="reg-program"
                  name="programInterest"
                  value={formData.programInterest}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                >
                  {programsList.length > 0 ? (
                    programsList.map((p) => (
                      <option key={p.id} value={p.title}>
                        {p.title}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Bahasa Jepang Dasar (N5)">Bahasa Jepang Dasar (N5)</option>
                      <option value="Bahasa Jepang Intensif (N4)">Bahasa Jepang Intensif (N4)</option>
                      <option value="Persiapan Kerja Tokutei Ginou (SSW)">Persiapan Kerja Tokutei Ginou (SSW)</option>
                    </>
                  )}
                </select>
                <BookOpen
                  size={17}
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

            {/* Password & Confirm Password Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
              <div>
                <label
                  htmlFor="reg-password"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 6 karakter"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock
                    size={17}
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

              <div>
                <label
                  htmlFor="reg-confirmpassword"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.35rem'
                  }}
                >
                  Ulangi Kata Sandi *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-confirmpassword"
                    type="password"
                    required
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi kata sandi"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--surface)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock
                    size={17}
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
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={ArrowRight}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Mendaftarkan Akun Siswa...' : 'Daftar Akun Siswa'}
            </Button>

            <div
              style={{
                marginTop: '1.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                textAlign: 'center',
                fontSize: '0.86rem',
                color: 'var(--text-secondary)'
              }}
            >
              Sudah memiliki akun siswa?{' '}
              <Link
                to="/login"
                style={{
                  color: 'var(--vermilion)',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Masuk di Sini
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
