import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import SectionHeading from '../../components/common/SectionHeading';
import FAQAccordion from '../../components/common/FAQAccordion';
import CTASection from '../../components/common/CTASection';
import { faqService } from '../../services/dataService';
import { BRAND } from '../../config/brand';

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    faqService.getAll().then((data) => setFaqs(data));
  }, []);

  const categories = [
    { key: 'ALL', label: 'Semua Kategori' },
    { key: 'Program', label: 'Program & Kurikulum' },
    { key: 'Registration', label: 'Alur Pendaftaran' },
    { key: 'Class', label: 'Jadwal & Asrama' },
    { key: 'Japanese Language', label: 'Ujian Bahasa Jepang' },
    { key: 'Japan Preparation', label: 'Persiapan Kerja & Visa' }
  ];

  const filtered = faqs.filter((item) => {
    const matchCat = activeCategory === 'ALL' || item.category === activeCategory;
    const matchSearch =
      searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <section className="section-py-sm" style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="よくある質問"
            categoryTag="PUSAT INFORMASI & FAQ"
            title={`Pertanyaan yang Kerap Ditanyakan Seputar ${BRAND.shortName}`}
            subtitle="Kami mengedepankan transparansi agar Anda dapat merencanakan masa depan pendidikan dan karier dengan penuh keyakinan."
            alignment="center"
          />

          {/* Search Box */}
          <div style={{ maxWidth: '640px', margin: '0 auto 2rem auto', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Cari pertanyaan (misal: asrama, biaya, SSW, JLPT)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.95rem 1rem 0.95rem 3rem',
                fontSize: '0.95rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none'
              }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            {categories.map((c) => {
              const active = activeCategory === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setActiveCategory(c.key)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: active ? 'var(--vermilion)' : 'var(--border-subtle)',
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

          {/* Accordion List */}
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            {filtered.length > 0 ? (
              <FAQAccordion items={filtered} />
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <p style={{ color: 'var(--text-muted)' }}>Tidak ditemukan pertanyaan yang cocok dengan pencarian "{searchQuery}".</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <CTASection
        title="Masih Punya Pertanyaan yang Belum Terjawab?"
        subtitle="Konsultasikan langsung dengan sensei dan staf admisi kami melalui obrolan WhatsApp resmi."
      />
    </div>
  );
}
