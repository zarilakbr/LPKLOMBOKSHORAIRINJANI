import React, { useState, useEffect } from 'react';
import SectionHeading from '../../components/common/SectionHeading';
import OpportunityCard from '../../components/public/OpportunityCard';
import CTASection from '../../components/common/CTASection';
import { opportunityService } from '../../services/dataService';
import { BRAND } from '../../config/brand';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [selectedSector, setSelectedSector] = useState('ALL');

  useEffect(() => {
    opportunityService.getAll().then((data) => setOpportunities(data));
  }, []);

  const sectors = [
    { key: 'ALL', label: 'Semua Bidang' },
    { key: 'Caregiving / Perawat Lansia', label: 'Caregiver (Kaigo)' },
    { key: 'Manufacturing / Permesinan', label: 'Manufaktur' },
    { key: 'Food Manufacturing & Catering', label: 'Pengolahan Makanan' },
    { key: 'Agriculture / Pertanian', label: 'Pertanian' },
    { key: 'Hospitality & Tourism', label: 'Perhotelan' },
    { key: 'Construction / Konstruksi', label: 'Konstruksi' }
  ];

  const filtered = selectedSector === 'ALL'
    ? opportunities
    : opportunities.filter((o) => o.sector === selectedSector);

  return (
    <div>
      <section className="section-py-sm" style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="特定技能・就労機会"
            categoryTag="SEKTOR KERJA JEPANG RESMI"
            title="Peluang Karier Tokutei Ginou di Berbagai Prefektur Jepang"
            subtitle="Jalur visa kerja keahlian resmi dengan standar gaji setara warga Jepang, perlindungan asuransi sosial, dan masa tinggal terstruktur."
          />

          {/* Sector Filter Pills */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '1.5rem', marginBottom: '2.5rem' }}>
            {sectors.map((sec) => {
              const active = selectedSector === sec.key;
              return (
                <button
                  key={sec.key}
                  onClick={() => setSelectedSector(sec.key)}
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
                  {sec.label}
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <div className="grid-3">
            {filtered.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ingin Tahu Sektor Mana yang Paling Cocok untuk Anda?"
        subtitle={`Konsultasikan latar belakang pendidikan, usia, dan minat bidang kerja Anda bersama tim penempatan ${BRAND.name}.`}
      />
    </div>
  );
}
