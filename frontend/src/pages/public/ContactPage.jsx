import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import SectionHeading from '../../components/common/SectionHeading';
import Button from '../../components/common/Button';
import { mockSiteSettings } from '../../data/mockSiteSettings';

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Konsultasi Program',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div>
      <section className="section-py-sm" style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="お問い合わせ"
            categoryTag="HUBUNGI KAMI"
            title="Pintu Konsultasi Selalu Terbuka untuk Masa Depan Anda"
            subtitle="Kunjungi kampus kami, kirimkan pesan formulir, atau hubungi langsung via WhatsApp untuk respon cepat dari konsultan kami."
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
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Kampus & Kantor Pusat</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {mockSiteSettings.address}
                      </p>
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
                        {mockSiteSettings.phone} / {mockSiteSettings.whatsapp}
                      </p>
                      <div style={{ marginTop: '0.75rem' }}>
                        <Button href={mockSiteSettings.whatsappUrl} variant="primary" size="sm">
                          Chat Langsung via WhatsApp
                        </Button>
                      </div>
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
                        {mockSiteSettings.email}
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
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Jam Operasional Kampus</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                        {mockSiteSettings.operatingHours}
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
                    Pesan Berhasil Terkirim!
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
                    Terima kasih, {formData.name}. Pertanyaan Anda telah diterima oleh tim administrasi {mockSiteSettings.institutionName}. Kami akan merespon melalui email atau WhatsApp dalam 1x24 jam kerja.
                  </p>
                  <Button onClick={() => setFormSubmitted(false)} variant="outline">
                    Kirim Pesan Lainnya
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1.75rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>Kirim Pesan Pertanyaan</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Tuliskan detail hal yang ingin Anda tanyakan kepada konsultan kami.
                    </p>
                  </div>

                  <div className="form-group">
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
                    <div className="form-group">
                      <label className="form-label">Alamat Email *</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="contoh@gmail.com"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">No. WhatsApp / HP *</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="0812xxxxxxx"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Topik Pertanyaan</label>
                    <select
                      className="form-select"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="Konsultasi Program">Konsultasi Program Pelatihan</option>
                      <option value="Jadwal Kelas">Jadwal Kelas & Pendaftaran</option>
                      <option value="Tokutei Ginou">Persyaratan Kerja Tokutei Ginou (SSW)</option>
                      <option value="Biaya & Asrama">Informasi Biaya & Fasilitas Asrama</option>
                      <option value="Kunjungan Kampus">Reservasi Kunjungan Kampus</option>
                      <option value="Lainnya">Pertanyaan Lainnya</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pesan / Pertanyaan Anda *</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Tuliskan pertanyaan Anda dengan jelas..."
                      rows="4"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" icon={Send} style={{ width: '100%' }}>
                    Kirim Pesan Sekarang
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Interactive Map Placeholder */}
          <div style={{ marginTop: '4rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Peta Lokasi Kampus</h3>
            <div
              style={{
                width: '100%',
                height: '320px',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-strong)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                color: 'var(--text-secondary)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <MapPin size={36} color="var(--vermilion)" />
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {mockSiteSettings.institutionName} - Gedung Lombok Shorai Center
              </div>
              <div style={{ fontSize: '0.85rem' }}>{mockSiteSettings.address}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                [Simulasi Peta Interaktif - Siap Terintegrasi Google Maps API]
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
