import React, { useState, useEffect } from 'react';
import SectionHeading from '../../components/common/SectionHeading';
import TestimonialCard from '../../components/public/TestimonialCard';
import CTASection from '../../components/common/CTASection';
import { testimonialService } from '../../services/dataService';
import { BRAND } from '../../config/brand';

export default function StoriesPage() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    testimonialService.getAll().then((data) => setTestimonials(data));
  }, []);

  return (
    <div>
      <section className="section-py-sm" style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="卒業生の声"
            categoryTag="CERITA ALUMNI & TESTIMONI"
            title={`Kisah Nyata Lulusan ${BRAND.name} yang Telah Berkarier di Jepang`}
            subtitle="Inspirasi nyata dari para alumni yang berhasil melalui tahapan bimbingan intensif dan kini berkarya di Tokyo, Aichi, Kanagawa, dan kota lainnya."
          />

          <div
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: 'var(--ochre-subtle)',
              border: '1px solid var(--ochre-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              color: 'var(--ochre)',
              marginBottom: '2.5rem'
            }}
          >
            <strong>Pemberitahuan Pengembangan:</strong> Seluruh testimoni pada halaman ini merupakan representasi konten simulasi pengembangan (demo data) sesuai standar PRD Master.
          </div>

          <div className="grid-2">
            {testimonials.map((testi) => (
              <TestimonialCard key={testi.id} testimonial={testi} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Jadilah Bagian dari Cerita Sukses Berikutnya"
        subtitle="Mulai langkah pertamamu sekarang juga. Bimbingan terarah akan mengubah tekadmu menjadi kenyataan di Jepang."
      />
    </div>
  );
}
