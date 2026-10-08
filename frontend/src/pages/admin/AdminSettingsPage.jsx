import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, Globe, Phone, Building, MapPin, ExternalLink } from 'lucide-react';
import FormField from '../../components/admin/FormField';
import { settingsService } from '../../services/dataService';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(null);
  const [feedbackError, setFeedbackError] = useState(null);

  useEffect(() => {
    settingsService.getSettings()
      .then((data) => {
        setSettings(data || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
        setError('Gagal memuat pengaturan sistem.');
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedbackSuccess(null);
    setFeedbackError(null);

    try {
      const payload = {
        ...settings,
        institutionName: settings.institutionName || 'LPK Lombok Shorai Rinjani',
        address: settings.address || '',
        phone: settings.phone || '',
        whatsapp: settings.whatsapp || '',
        email: settings.email || '',
        googleMapsUrl: settings.googleMapsUrl || settings.mapsUrl || '',
        mapsUrl: settings.googleMapsUrl || settings.mapsUrl || '',
      };

      await settingsService.updateSettings(payload);
      setFeedbackSuccess('Pengaturan identitas, kontak resmi lembaga, dan lokasi berhasil disimpan ke database!');
      setTimeout(() => setFeedbackSuccess(null), 5000);
    } catch (err) {
      console.error('Failed to update settings:', err);
      const msg = err.response?.data?.message || err.message || 'Gagal menyimpan perubahan pengaturan.';
      setFeedbackError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Memuat konfigurasi sistem...</div>;
  }

  if (error || !settings) {
    return (
      <div style={{ padding: '2rem', color: '#EF4444' }}>
        {error || 'Data pengaturan tidak ditemukan.'}
      </div>
    );
  }

  const currentMapsUrl = settings.googleMapsUrl || settings.mapsUrl || '';

  return (
    <div style={{ maxWidth: '920px' }}>
      {/* Success Notification */}
      {feedbackSuccess && (
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
          <span style={{ fontWeight: 600 }}>{feedbackSuccess}</span>
        </div>
      )}

      {/* Error Notification */}
      {feedbackError && (
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-sm)',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '1.5rem'
          }}
        >
          <AlertCircle size={18} />
          <span style={{ fontWeight: 600 }}>{feedbackError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Profil Lembaga & Legalitas */}
        <div className="card-editorial" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={20} color="var(--vermilion)" />
            <span>Identitas Resmi & Lokasi Lembaga</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
            Informasi nama resmi lembaga, izin akreditasi, dan alamat fisik kampus yang tampil di website publik.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Nama Lembaga (Indonesia) *"
              required
              value={settings.institutionName || settings.organization_name || ''}
              onChange={(e) => setSettings({ ...settings, institutionName: e.target.value, organization_name: e.target.value })}
            />
            <FormField
              label="Nama Lembaga (Aksara Jepang Kanji)"
              value={settings.japaneseName || settings.japanese_name || ''}
              onChange={(e) => setSettings({ ...settings, japaneseName: e.target.value, japanese_name: e.target.value })}
            />
          </div>

          <FormField
            label="Nomor SK Akreditasi / Izin Kemenaker RI"
            value={settings.legalAccreditation || ''}
            onChange={(e) => setSettings({ ...settings, legalAccreditation: e.target.value })}
            placeholder="Contoh: Lembaga Pelatihan Kerja Resmi Terdaftar Kemenaker RI"
          />

          <FormField
            label="Alamat Lengkap Kantor & Kampus *"
            type="textarea"
            rows={2}
            required
            value={settings.address || ''}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            placeholder="Contoh: Jl. Raya Abdul Aziz.99 Parwa, Dusun Parwa, Dasan Tapen, Kec. Gerung, Kab. Lombok Barat, NTB 83363"
            helpText="Alamat fisik lengkap yang akan tampil di halaman Kontak, Footer, dan profil resmi."
          />

          <div style={{ marginTop: '0.5rem' }}>
            <FormField
              label="Tautan URL Google Maps (Navigasi Lokasi)"
              value={currentMapsUrl}
              onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value, mapsUrl: e.target.value })}
              placeholder="https://maps.google.com/?q=..."
              helpText="URL peta Google Maps lokasi gedung/kantor LPK untuk tombol navigasi calon peserta."
            />
            {currentMapsUrl && (
              <div style={{ marginTop: '0.5rem' }}>
                <a
                  href={currentMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-xs"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                >
                  <MapPin size={13} />
                  <span>Uji Buka di Google Maps</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Kontak & Media Sosial */}
        <div className="card-editorial" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: '#FFFFFF' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={20} color="var(--vermilion)" />
            <span>Kontak & Saluran Komunikasi Resmi</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1.5rem' }}>
            Saluran informasi pendaftaran, layanan konsultasi WhatsApp, dan email resmi LPK.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Nomor WhatsApp Hotline Resmi *"
              required
              value={settings.whatsapp || ''}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              placeholder="+81 80-7507-9228"
              helpText="Format nomor internasional, contoh: +81 80-7507-9228 atau +62 8..."
            />
            <FormField
              label="Nomor Telepon Kantor"
              value={settings.phone || ''}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="+81 80-7507-9228"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <FormField
              label="Email Resmi Informasi *"
              type="email"
              required
              value={settings.email || ''}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="damar.muammar@gmail.com"
              helpText="Email utama untuk korespondensi surat menyurat dan pertanyaan formulir."
            />
            <FormField
              label="Jam Operasional Lembaga"
              value={settings.operatingHours || settings.operating_hours || ''}
              onChange={(e) => setSettings({ ...settings, operatingHours: e.target.value, operating_hours: e.target.value })}
              placeholder="Senin – Sabtu: 08.00 – 17.00 WITA"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <FormField
              label="Link Instagram"
              value={settings.socialMedia?.instagram || ''}
              onChange={(e) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, instagram: e.target.value } })}
              placeholder="https://instagram.com/lombokshorairinjani"
            />
            <FormField
              label="Link TikTok"
              value={settings.socialMedia?.tiktok || ''}
              onChange={(e) => setSettings({ ...settings, socialMedia: { ...settings.socialMedia, tiktok: e.target.value } })}
              placeholder="https://tiktok.com/@lombokshorairinjani"
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

        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary btn-lg"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Save size={18} />
          <span>{saving ? 'Menyimpan Pengaturan...' : 'Simpan Seluruh Pengaturan'}</span>
        </button>
      </form>
    </div>
  );
}
