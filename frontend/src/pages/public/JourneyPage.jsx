import React from 'react';
import SectionHeading from '../../components/common/SectionHeading';
import JourneyTimeline from '../../components/public/JourneyTimeline';
import CTASection from '../../components/common/CTASection';

export default function JourneyPage() {
  return (
    <div>
      <section className="section-py-sm" style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="ロードマップ"
            categoryTag="ALUR BELAJAR & PEMBERDAYAAN"
            title="Peta Perjalanan Karier dan Pelatihan Bahasa Terstruktur"
            subtitle="Dari langkah pertama mengenal alfabet Jepang hingga penempatan kerja dan masa tinggal resmi di Jepang."
          />

          <JourneyTimeline />
        </div>
      </section>

      <CTASection
        title="Siap Mengawali Langkah Pertamamu Hari Ini?"
        subtitle="Daftar sekarang dan mulailah tahapan Tahap 01 Fondasi Dasar Bahasa bersama sensei pembimbing kami."
      />
    </div>
  );
}
