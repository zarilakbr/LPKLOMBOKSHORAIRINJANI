import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { mockSiteSettings } from '../../data/mockSiteSettings';
import { BRAND } from '../../config/brand';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-dark)',
        color: 'var(--text-on-dark)',
        borderTop: '1px solid var(--border-dark)',
        paddingTop: 'clamp(3rem, 5vw, 4.5rem)',
        paddingBottom: 'clamp(2rem, 4vw, 3rem)'
      }}
    >
      <div className="container">
        {/* Top Editorial Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: 'clamp(2rem, 4vw, 3rem)',
            paddingBottom: 'clamp(2rem, 4vw, 3.5rem)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Col 1: Brand & Philosophy */}
          <div style={{ maxWidth: '340px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <img
                src={BRAND.logo}
                alt={BRAND.name}
                style={{
                  width: '42px',
                  height: '42px',
                  objectFit: 'contain',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  padding: '2px',
                  flexShrink: 0
                }}
              />
              <div>
                <div style={{ fontFamily: 'var(--font-jp)', fontSize: '0.72rem', color: '#FDA4AF', fontWeight: 600 }}>
                  {BRAND.japaneseName}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {BRAND.name}
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Lembaga Pelatihan Kerja Bahasa Jepang terakreditasi resmi. Mempersiapkan generasi muda Indonesia dengan penguasaan bahasa murni, kedisiplinan budaya kerja (Horenso), dan kompetensi karier berdaya saing global di Jepang bersama {BRAND.shortName}.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.8rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                color: '#E2E8F0'
              }}
            >
              <ShieldCheck size={16} color="var(--vermilion)" />
              <span>{mockSiteSettings.legalAccreditation}</span>
            </div>
          </div>

          {/* Col 2: Program Pelatihan */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '0.02em' }}>
              Program Pelatihan
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li>
                <Link to="/programs/bahasa-jepang-dasar-n5" style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  Bahasa Jepang Dasar (N5)
                </Link>
              </li>
              <li>
                <Link to="/programs/bahasa-jepang-intensif-n4" style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  Bahasa Jepang Intensif (N4)
                </Link>
              </li>
              <li>
                <Link to="/programs/persiapan-kerja-tokutei-ginou-ssw" style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  Persiapan Tokutei Ginou (SSW)
                </Link>
              </li>
              <li>
                <Link to="/programs/persiapan-jlpt-n3-percakapan-kerja" style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  Persiapan Ujian JLPT N3
                </Link>
              </li>
              <li>
                <Link to="/programs/kelas-percakapan-praktis-kaiwa" style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  Kelas Percakapan (Native Kaiwa)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigasi Cepat */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '0.02em' }}>
              Navigasi Lembaga
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li>
                <Link to="/about" style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem' }}>
                  Tentang {BRAND.shortName}
                </Link>
              </li>
              <li>
                <Link to="/classes" style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem' }}>
                  Jadwal & Kuota Kelas
                </Link>
              </li>
              <li>
                <Link to="/opportunities" style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem' }}>
                  Peluang Karier di Jepang
                </Link>
              </li>
              <li>
                <Link to="/journey" style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem' }}>
                  5 Tahap Alur Belajar
                </Link>
              </li>
              <li>
                <Link to="/facilities" style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem' }}>
                  Fasilitas & Asrama Kampus
                </Link>
              </li>
              <li>
                <Link to="/stories" style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem' }}>
                  Cerita Alumni di Jepang
                </Link>
              </li>
              <li>
                <Link to="/articles" style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem' }}>
                  Artikel & Tips Belajar
                </Link>
              </li>
              <li>
                <Link to="/faq" style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.9rem' }}>
                  Pusat Bantuan & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Informasi Kontak & Jam Kerja */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '0.02em' }}>
              Kantor Pusat & Informasi
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <MapPin size={18} color="var(--vermilion)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                <span style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  {mockSiteSettings.address}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Phone size={18} color="var(--vermilion)" style={{ flexShrink: 0 }} />
                <span style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.88rem' }}>
                  {mockSiteSettings.phone} ({mockSiteSettings.whatsapp})
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Mail size={18} color="var(--vermilion)" style={{ flexShrink: 0 }} />
                <span style={{ color: 'var(--text-on-dark-muted)', fontSize: '0.88rem' }}>
                  {mockSiteSettings.email}
                </span>
              </div>
              <div style={{ marginTop: '0.5rem', padding: '0.85rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E2E8F0', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Jam Pelayanan Kampus
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-on-dark-muted)' }}>
                  {mockSiteSettings.operatingHours}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Editorial Legal Notice */}
        <div
          style={{
            paddingTop: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem',
            color: 'var(--text-on-dark-muted)',
            textAlign: 'center'
          }}
        >
          <div>
            &copy; {currentYear} {mockSiteSettings.institutionName}. Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div style={{ fontStyle: 'italic', opacity: 0.7, maxWidth: '720px' }}>
            Disclaimer: Website ini dikembangkan sebagai portal resmi pelatihan bahasa dan persiapan kerja. Seluruh informasi disajikan transparan tanpa klaim jaminan instan. Konten data pengujian merupakan materi simulasi resmi pengembangan.
          </div>
        </div>
      </div>
    </footer>
  );
}
