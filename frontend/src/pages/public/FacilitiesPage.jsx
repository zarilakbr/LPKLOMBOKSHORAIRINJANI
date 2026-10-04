import React, { useState, useEffect } from 'react';
import SectionHeading from '../../components/common/SectionHeading';
import FacilityCard from '../../components/public/FacilityCard';
import CTASection from '../../components/common/CTASection';
import { facilityService } from '../../services/dataService';
import { BRAND } from '../../config/brand';

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    facilityService.getAll().then((data) => setFacilities(data));
  }, []);

  const categories = [
    { key: 'ALL', label: 'Semua Fasilitas' },
    { key: 'Ruang Kelas', label: 'Ruang Kelas' },
    { key: 'Fasilitas Ujian', label: 'Lab Ujian CBT' },
    { key: 'Pelatihan Karier', label: 'Studio Wawancara' },
    { key: 'Pelatihan Teknis', label: 'Lab Praktik Kaigo' },
    { key: 'Pusat Studi', label: 'Perpustakaan & Budaya' },
    { key: 'Akomodasi', label: 'Asrama Siswa' }
  ];

  const filtered = filterCategory === 'ALL'
    ? facilities
    : facilities.filter((f) => f.category === filterCategory);

  return (
    <div>
      <section className="section-py-sm" style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="施設環境"
            categoryTag="SARANA & PRASARANA LEMBAGA"
            title="Standar Fasilitas Terpadu untuk Kesiapan Belajar & Keterampilan Kerja"
            subtitle="Kami berinvestasi pada sarana simulator kerja dan lingkungan disiplin untuk menghadirkan atmosfer nyata tempat kerja Jepang di Indonesia."
          />

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '1.5rem', marginBottom: '2.5rem' }}>
            {categories.map((c) => {
              const active = filterCategory === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setFilterCategory(c.key)}
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
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="grid-3">
            {filtered.map((fac) => (
              <FacilityCard key={fac.id} facility={fac} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title={`Ingin Mengunjungi Lembaga ${BRAND.name} Secara Langsung?`}
        subtitle="Jadwalkan kunjungan observasi kelas langsung bersama konsultan kami di Mataram, Nusa Tenggara Barat."
      />
    </div>
  );
}
