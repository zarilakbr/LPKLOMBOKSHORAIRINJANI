import React from 'react';
import { ShieldCheck, Award, Building2, Users2, Landmark, CheckCircle2 } from 'lucide-react';
import SectionHeading from '../common/SectionHeading';

export default function TrustSection() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: "Legalitas & Akreditasi Resmi",
      description: "Terdaftar dan memiliki izin operasional resmi dari Kementerian Ketenagakerjaan RI (Kemnaker) serta Dinas Tenaga Kerja setempat dengan standar kepatuhan tinggi."
    },
    {
      icon: Award,
      title: "Instruktur Bersertifikat N1 & Native",
      description: "Dibimbing langsung oleh sensei penutur asli asal Jepang serta instruktur profesional Indonesia pemegang sertifikasi JLPT level N1 dan mantan tenaga ahli di Jepang."
    },
    {
      icon: Building2,
      title: "Jaringan Mitra di Berbagai Prefektur",
      description: "Terhubung dengan jejaring Registered Support Organizations (RSO) dan asosiasi penerima resmi di Tokyo, Aichi, Kanagawa, Osaka, hingga Hokkaido."
    },
    {
      icon: Users2,
      title: "Pendampingan Menyeluruh & Humanis",
      description: "Mulai dari pembentukan karakter mental, simulasi wawancara, bimbingan dokumen imigrasi CoE, hingga pendampingan adaptasi saat tiba di Jepang."
    }
  ];

  return (
    <section className="section-py" style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <SectionHeading
          jpSubtitle="信頼と実績"
          categoryTag="KEPERCAYAAN & AKREDITASI"
          title="Komitmen Pendidikan Transparan & Standar Mutu Berkelanjutan"
          subtitle="Membangun karier internasional membutuhkan fondasi legalitas yang kokoh dan kurikulum yang teruji di dunia industri nyata."
          alignment="center"
        />

        <div className="grid-4" style={{ marginTop: '2.5rem' }}>
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  padding: '2rem 1.75rem',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'all 0.25s ease'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor: 'var(--vermilion-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--vermilion)'
                  }}
                >
                  <Icon size={22} strokeWidth={2.2} />
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--text-secondary)', margin: 0 }}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Accreditation Banner */}
        <div
          style={{
            marginTop: '3.5rem',
            padding: '1.5rem 2rem',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Landmark size={24} color="var(--vermilion)" />
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Verifikasi Lembaga Pelatihan Kerja (LPK) Terdaftar
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                SK Izin Operasional Kemenaker RI: No. Kep. 542/LATTAS/2023 | VIN (Vocational Identification Number) Resmi
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald)', fontWeight: 700, fontSize: '0.85rem' }}>
            <CheckCircle2 size={18} />
            <span>Status Terverifikasi Aktif</span>
          </div>
        </div>
      </div>
    </section>
  );
}
