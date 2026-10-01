import React, { useState, useEffect } from 'react';
import SectionHeading from '../../components/common/SectionHeading';
import ArticleCard from '../../components/public/ArticleCard';
import CTASection from '../../components/common/CTASection';
import { articleService } from '../../services/dataService';

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [selectedCat, setSelectedCat] = useState('ALL');

  useEffect(() => {
    articleService.getAll().then((data) => setArticles(data));
  }, []);

  const categories = [
    { key: 'ALL', label: 'Semua Artikel' },
    { key: 'Persiapan Kerja', label: 'Persiapan Kerja' },
    { key: 'Tips Belajar', label: 'Tips Belajar' },
    { key: 'Budaya Jepang', label: 'Budaya Jepang' }
  ];

  const filtered = selectedCat === 'ALL'
    ? articles
    : articles.filter((a) => a.category === selectedCat);

  return (
    <div>
      <section className="section-py-sm" style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="情報発信・コラム"
            categoryTag="PUSAT EDUKASI & KNOWLEDGE HUB"
            title="Artikel, Tips Belajar Bahasa & Panduan Karier di Jepang"
            subtitle="Panduan komprehensif dari tim pengajar dan praktisi ketenagakerjaan Jepang untuk membekali persiapan Anda."
          />

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '1.5rem', marginBottom: '2.5rem' }}>
            {categories.map((c) => {
              const active = selectedCat === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setSelectedCat(c.key)}
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
            {filtered.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ingin Memperdalam Pembelajaran Bersama Sensei Berpengalaman?"
        subtitle="Daftar kelas intensif sekarang dan dapatkan modul silabus lengkap serta simulasi tes berkala."
      />
    </div>
  );
}
