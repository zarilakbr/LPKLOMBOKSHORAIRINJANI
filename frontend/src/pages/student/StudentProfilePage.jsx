import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, GraduationCap, ShieldCheck, Check } from 'lucide-react';
import { studentAuthService } from '../../services/dataService';
import Button from '../../components/common/Button';

export default function StudentProfilePage() {
  const currentStudent = studentAuthService.getCurrentUser() || {
    id: 0,
    name: 'Siswa LPK',
    email: '',
    phone: '',
    department: 'Siswa Aktif'
  };

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Profil Siswa
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
          Informasi biodata akun siswa dan kontak resmi pendaftaran Anda.
        </p>
      </div>

      <div className="student-card" style={{ maxWidth: '720px' }}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--vermilion)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800
              }}
            >
              {currentStudent.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {currentStudent.name}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {currentStudent.department || 'Calon Siswa'} • Status: Aktif
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Nama Lengkap
              </label>
              <input
                type="text"
                defaultValue={currentStudent.name}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Alamat Email
              </label>
              <input
                type="email"
                defaultValue={currentStudent.email}
                disabled
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface-muted)',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="tel"
                defaultValue={currentStudent.phone || ''}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Pendidikan Terakhir
              </label>
              <input
                type="text"
                defaultValue="SMK / SMA"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Button type="submit" variant="primary" size="md">
              Simpan Perubahan
            </Button>
            {saved && (
              <span style={{ fontSize: '0.84rem', color: 'var(--emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Check size={16} /> Data profil berhasil disimpan.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
