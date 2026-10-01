import React, { useState } from 'react';
import { Settings, Lock, Bell, Check, Shield } from 'lucide-react';
import Button from '../../components/common/Button';

export default function StudentSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Pengaturan Akun Siswa
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
          Kelola keamanan kata sandi dan preferensi notifikasi Anda.
        </p>
      </div>

      <div className="student-card" style={{ maxWidth: '640px' }}>
        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} color="var(--vermilion)" />
            <span>Ganti Kata Sandi</span>
          </h3>

          <div style={{ marginBottom: '1.15rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Kata Sandi Saat Ini
            </label>
            <input
              type="password"
              placeholder="••••••••"
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

          <div style={{ marginBottom: '1.15rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Kata Sandi Baru
            </label>
            <input
              type="password"
              placeholder="Minimal 6 karakter"
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

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              type="password"
              placeholder="Ulangi kata sandi baru"
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Button type="submit" variant="primary" size="md">
              Perbarui Kata Sandi
            </Button>
            {saved && (
              <span style={{ fontSize: '0.84rem', color: 'var(--emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Check size={16} /> Pengaturan berhasil diperbarui.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
