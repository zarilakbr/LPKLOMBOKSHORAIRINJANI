import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, ShieldCheck, Globe, Phone, Building } from 'lucide-react';
import FormField from '../../components/admin/FormField';
import Button from '../../components/common/Button';
import { settingsService } from '../../services/dataService';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    settingsService.getSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await settingsService.updateSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (loading || !settings) {
    return <div style={{ padding: '2rem' }}>Memuat konfigurasi sistem...</div>;
  }

  return (
    <div style={{ maxWidth: '920px' }}>
      {saveSuccess && (
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: 'var(--radius-sm)',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '1.5rem'
          }}
        >
          <CheckCircle2 size={18} />
          <span style={{ fontWeight: 600 }}>Pengaturan lembaga berhasil disimpan ke state mock sistem!</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Profil Lembaga & Legalitas */}
        <div className="card-editorial" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={20} color="var(--vermilion)" />
            <span>Identitas Resmi Lembaga</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
            Informasi nama dan legalitas lembaga yang ditampilkan di website publik.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Nama Lembaga (Indonesia)"
              required
              value={settings.institutionName}
              onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
            />
            <FormField
              label="Nama Lembaga (Aksara Jepang Kanji)"
              required
              value={settings.japaneseName}
              onChange={(e) => setSettings({ ...settings, japaneseName: e.target.value })}
            />
          </div>

          <FormField
            label="Nomor SK Akreditasi / Izin Kemenaker RI"
            required
            value={settings.legalAccreditation}
            onChange={(e) => setSettings({ ...settings, legalAccreditation: e.target.value })}
          />

          <FormField
            label="Alamat Kampus Lengkap"
            type="textarea"
            rows={2}
            required
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
          />
        </div>

        {/* Section 2: Kontak & Media Sosial */}
        <div className="card-editorial" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={20} color="var(--vermilion)" />
            <span>Kontak & Saluran Komunikasi</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
            Saluran informasi pendaftaran dan layanan bantuan calon peserta.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Nomor WhatsApp Resmi"
              required
              value={settings.whatsapp}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
            />
            <FormField
              label="Nomor Telepon Kantor"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Email Resmi Informasi"
              type="email"
              required
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            />
            <FormField
              label="Jam Operasional Kampus"
              value={settings.operatingHours}
              onChange={(e) => setSettings({ ...settings, operatingHours: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Link Instagram"
              value={settings.socialMedia?.instagram || ''}
              onChange={(e) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, instagram: e.target.value } })}
            />
            <FormField
              label="Link TikTok"
              value={settings.socialMedia?.tiktok || ''}
              onChange={(e) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, tiktok: e.target.value } })}
            />
          </div>
        </div>

        {/* Section 3: Headline & Hero Copy */}
        <div className="card-editorial" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={20} color="var(--vermilion)" />
            <span>Konten Hero & Banner Utama</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
            Teks headline yang tampil pada banner pertama website publik.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Judul Utama Baris 1"
              value={settings.hero?.titlePrimary || ''}
              onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, titlePrimary: e.target.value } })}
            />
            <FormField
              label="Judul Sorotan (Warna Merah)"
              value={settings.hero?.titleHighlight || ''}
              onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, titleHighlight: e.target.value } })}
            />
          </div>

          <FormField
            label="Deskripsi Pendukung Hero"
            type="textarea"
            rows={3}
            value={settings.hero?.description || ''}
            onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, description: e.target.value } })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Teks Tombol CTA Utama"
              value={settings.hero?.primaryCtaText || ''}
              onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, primaryCtaText: e.target.value } })}
            />
            <FormField
              label="Teks Tombol CTA Sekunder"
              value={settings.hero?.secondaryCtaText || ''}
              onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, secondaryCtaText: e.target.value } })}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={18} />
          <span>Simpan Seluruh Pengaturan</span>
        </button>
      </form>
    </div>
  );
}
