import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import SectionHeading from '../../components/common/SectionHeading';
import Button from '../../components/common/Button';
import TurnstileWidget from '../../components/common/TurnstileWidget';
import { mockSiteSettings } from '../../data/mockSiteSettings';
import { settingsService } from '../../services/dataService';

export default function ContactPage() {
  const [siteSettings, setSiteSettings] = useState(mockSiteSettings);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Konsultasi Program',
    message: ''
  });

  useEffect(() => {
    settingsService.getPublicSettings()
      .then((data) => {
        if (data) {
          setSiteSettings((prev) => ({
            ...prev,
            ...data,
            institutionName: data.institutionName || prev.institutionName,
            address: data.address || prev.address,
            phone: data.phone || prev.phone,
            whatsapp: data.whatsapp || prev.whatsapp,
            whatsappUrl: data.whatsappUrl || prev.whatsappUrl,
            email: data.email || prev.email,
            operatingHours: data.operatingHours || data.operating_hours || prev.operatingHours,
            mapsUrl: data.googleMapsUrl || data.maps_url || prev.mapsUrl,
            googleMapsUrl: data.googleMapsUrl || data.maps_url || prev.googleMapsUrl
          }));
        }
      })
      .catch((err) => {
        console.warn('Could not fetch remote settings, using default brand info:', err);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const mapsLink = siteSettings.googleMapsUrl || siteSettings.mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(siteSettings.address || '')}`;

  return (
    <div>
      <section className="section-py-sm" style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="お問い合わせ"
            categoryTag="HUBUNGI KAMI"
            title="Pintu Konsultasi Selalu Terbuka untuk Masa Depan Anda"
            subtitle="Kunjungi lembaga kami, kirimkan pesan formulir, atau hubungi langsung via WhatsApp untuk respon cepat dari konsultan kami."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '3.5rem', marginTop: '2.5rem' }} className="contact-split">
            {/* Left Column: Contact Cards */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Office Card */}
                <div className="card-editorial" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '42px', height: '42px', backgroundColor: 'var(--vermilion-subtle)', color: 'var(--vermilion)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Gedung Pelatihan & Kantor Pusat</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {siteSettings.address}
                      </p>
                      {mapsLink && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <Button
                            href={mapsLink}
                            variant="outline"
                            size="sm"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <MapPin size={14} />
                            <span>Buka di Google Maps</span>
                            <ExternalLink size={12} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* WhatsApp & Phone */}
                <div className="card-editorial" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '42px', height: '42px', backgroundColor: 'var(--emerald-subtle)', color: 'var(--emerald)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Phone size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Telepon & WhatsApp</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {siteSettings.phone || siteSettings.whatsapp || '+81 80-7507-9228'}
                      </p>
                      {siteSettings.whatsappUrl && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <Button href={siteSettings.whatsappUrl} variant="primary" size="sm" target="_blank" rel="noopener noreferrer">
                            Chat Langsung via WhatsApp
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="card-editorial" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '42px', height: '42px', backgroundColor: 'var(--ochre-subtle)', color: 'var(--ochre)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Mail size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Email Surat Menyurat</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                        <a href={`mailto:${siteSettings.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {siteSettings.email}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="card-editorial" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '42px', height: '42px', backgroundColor: '#F1F5F9', color: '#0F172A', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Clock size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Jam Operasional Lembaga</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {siteSettings.operatingHours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Inquiry Form */}
            <div className="card-editorial" style={{ padding: '2.5rem', backgroundColor: 'var(--bg-surface)' }}>
              {formSubmitted ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--emerald-subtle)', color: 'var(--emerald)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                    Pesan Terkirim
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto 1.75rem auto' }}>
                    Terima kasih, {formData.name}. Pertanyaan Anda telah diterima oleh tim administrasi {siteSettings.institutionName}. Kami akan merespon melalui email atau WhatsApp dalam 1x24 jam kerja.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: 'Konsultasi Program', message: '' });
                    }}
                  >
                    Kirim Pesan Lain
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                    Formulir Pertanyaan & Konsultasi
                  </h3>

                  <div>
                    <label className="form-label">Nama Lengkap *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Masukkan nama Anda"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label className="form-label">Alamat Email *</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="nama@email.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="form-label">No. WhatsApp / HP *</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="Contoh: 08123456789"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Topik Pertanyaan</label>
                    <select
                      className="form-input"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="Konsultasi Program">Konsultasi Program Bahasa Jepang</option>
                      <option value="Program Tokutei Ginou">Program Tokutei Ginou (SSW) Pekerja Berketerampilan</option>
                      <option value="Program Magang Ginou Jisshusei">Program Magang (Ginou Jisshusei)</option>
                      <option value="Biaya dan Skema Pembayaran">Informasi Biaya Pelatihan & Talangan</option>
                      <option value="Lainnya">Pertanyaan Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Pesan / Pertanyaan *</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Tuliskan pertanyaan Anda dengan jelas..."
                      rows="4"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <TurnstileWidget
                    onVerify={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken('')}
                  />

                  <Button type="submit" variant="primary" size="lg" icon={Send} style={{ width: '100%' }}>
                    Kirim Pesan Sekarang
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Interactive Map Preview */}
          <div style={{ marginTop: '4rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Peta Lokasi Gedung Lembaga</h3>
            <div
              style={{
                width: '100%',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-strong)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-surface-subtle)'
              }}
            >
              <iframe
                title="Peta Lokasi LPK Lombok Shorai Rinjani"
                width="100%"
                height="340"
                style={{ border: 0, display: 'block' }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(siteSettings.address || 'Jl. Raya Abdul Aziz.99 Parwa, Dusun Parwa, Dasan Tapen, Kec. Gerung, Kab. Lombok Barat, NTB 83363')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              />
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MapPin size={22} color="var(--vermilion)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {siteSettings.institutionName || 'LPK Lombok Shorai Rinjani'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {siteSettings.address}
                    </div>
                  </div>
                </div>

                <Button
                  href={mapsLink}
                  variant="primary"
                  size="sm"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <MapPin size={14} />
                  <span>Petunjuk Arah Google Maps</span>
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .contact-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
