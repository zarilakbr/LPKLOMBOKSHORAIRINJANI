import React, { useState, useEffect } from 'react';
import SectionHeading from '../../components/common/SectionHeading';
import ProgramCard from '../../components/public/ProgramCard';
import CTASection from '../../components/common/CTASection';
import { programService } from '../../services/dataService';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    programService.getAll().then((data) => setPrograms(data));
  }, []);

  const categories = [
    { key: 'ALL', label: 'Semua Program' },
    { key: 'Dasar & Pondasi', label: 'Dasar (N5)' },
    { key: 'Intensif Lanjutan', label: 'Intensif (N4)' },
    { key: 'Karier & Sertifikasi', label: 'Tokutei Ginou (SSW)' },
    { key: 'Tingkat Menengah', label: 'JLPT N3' },
    { key: 'Keterampilan Komunikasi', label: 'Kaiwa & Percakapan' }
  ];

  const filtered = selectedCategory === 'ALL'
    ? programs
    : programs.filter((p) => p.category === selectedCategory);

  return (
    <div>
      <section className="section-py-sm" style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="カリキュラム一覧"
            categoryTag="KATALOG PROGRAM PELATIHAN"
            title="Kurikulum Bahasa Jepang & Persiapan Karier Terstandar"
            subtitle="Pilih jenjang pelatihan yang selaras dengan target kemampuan bahasa dan tujuan karier Anda di Jepang."
          />

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '1.5rem', marginBottom: '2.5rem' }}>
            {categories.map((cat) => {
              const active = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: active ? 'var(--vermilion)' : 'var(--border-strong)',
                    backgroundColor: active ? 'var(--vermilion)' : 'var(--bg-surface)',
                    color: active ? '#FFFFFF' : 'var(--text-primary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Programs Grid */}
          <div className="grid-3">
            {filtered.map((prog) => (
              <ProgramCard key={prog.id} program={prog} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Masih Bingung Menentukan Level yang Tepat?"
        subtitle="Ikuti tes penempatan (Placement Test) gratis dan sesi konsultasi minat karier bersama sensei pembimbing kami."
      />
    </div>
  );
}
