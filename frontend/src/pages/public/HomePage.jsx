import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Building2, BookOpen, BriefcaseBusiness, Newspaper } from 'lucide-react';
import Hero from '../../components/public/Hero';
import TrustSection from '../../components/public/TrustSection';
import ProgramCard from '../../components/public/ProgramCard';
import OpportunityCard from '../../components/public/OpportunityCard';
import JourneyTimeline from '../../components/public/JourneyTimeline';
import FacilityCard from '../../components/public/FacilityCard';
import TestimonialCard from '../../components/public/TestimonialCard';
import ArticleCard from '../../components/public/ArticleCard';
import FAQAccordion from '../../components/common/FAQAccordion';
import CTASection from '../../components/common/CTASection';
import SectionHeading from '../../components/common/SectionHeading';
import Button from '../../components/common/Button';
import { programService, opportunityService, facilityService, testimonialService, articleService, faqService } from '../../services/dataService';
import { BRAND } from '../../config/brand';

export default function HomePage() {
  const [programs, setPrograms] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [articles, setArticles] = useState([]);
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    programService.getAll().then((data) => setPrograms(data.slice(0, 3)));
    opportunityService.getAll().then((data) => setOpportunities(data.slice(0, 3)));
    facilityService.getAll().then((data) => setFacilities(data.slice(0, 3)));
    testimonialService.getAll().then((data) => setTestimonials(data.slice(0, 3)));
    articleService.getAll().then((data) => setArticles(data.slice(0, 3)));
    faqService.getAll().then((data) => setFaqs(data.slice(0, 5)));
  }, []);

  return (
    <div className="home-page">
      {/* 2. Hero Section */}
      <Hero />

      {/* 3. Trust / Credibility Section */}
      <TrustSection />

      {/* 4. Programs Overview */}
      <section className="section-py" style={{ backgroundColor: 'var(--bg-canvas)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="プログラム"
            categoryTag="KURIKULUM & TINGKATAN"
            title="Program Pelatihan Terarah Menuju Kompetensi Nyata"
            subtitle="Mulai dari dasar aksara hingga pembekalan keahlian teknis Tokutei Ginou berstandar industri Jepang."
            action={
              <Button to="/programs" variant="outline" size="sm" icon={ArrowRight}>
                Lihat Seluruh Program
              </Button>
            }
          />

          <div className="grid-3">
            {programs.map((prog) => (
              <ProgramCard key={prog.id} program={prog} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Japanese Learning Journey */}
      <section className="section-py" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="学習のロードマップ"
            categoryTag="TAHAPAN BELAJAR SISTEMATIS"
            title="5 Langkah Terukur dari Nol Hingga Berangkat ke Jepang"
            subtitle="Kami memetakan setiap proses belajar menjadi tonggak capaian yang jelas tanpa lompatan materi yang membingungkan."
            alignment="center"
          />

          <JourneyTimeline />
        </div>
      </section>

      {/* 6. Japan Opportunities Section */}
      <section className="section-py" style={{ backgroundColor: 'var(--bg-canvas)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="日本での就職機会"
            categoryTag="JALUR KARIER RESMI"
            title="Peluang Kerja Sektor Unggulan di Berbagai Prefektur"
            subtitle="Jalur resmi visa Tokutei Ginou (SSW) dan Profesional dengan hak gaji dan perlindungan legalitas standar Jepang."
            action={
              <Button to="/opportunities" variant="outline" size="sm" icon={ArrowRight}>
                Jelajahi Semua Sektor
              </Button>
            }
          />

          <div className="grid-3">
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Featured Facilities */}
      <section className="section-py" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="施設紹介"
            categoryTag="LINGKUNGAN BELAJAR KONDUSIF"
            title="Infrastruktur Lembaga & Fasilitas Simulasi Nyata"
            subtitle="Fasilitas dirancang menyerupai standar tempat kerja di Jepang untuk membentuk kesiapan fisik dan mental."
            action={
              <Button to="/facilities" variant="outline" size="sm" icon={Building2} iconPosition="left">
                Tur Seluruh Fasilitas
              </Button>
            }
          />

          <div className="grid-3">
            {facilities.map((fac) => (
              <FacilityCard key={fac.id} facility={fac} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. Student Stories / Testimonials */}
      <section className="section-py" style={{ backgroundColor: 'var(--bg-canvas)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="卒業生の声"
            categoryTag="CERITA ALUMNI"
            title="Kisah Nyata Perjalanan Menembus Batas ke Negeri Sakura"
            subtitle={`Setiap langkah dimulai dari tekad dan bimbingan yang konsisten. Inilah pengalaman langsung para alumni ${BRAND.name}.`}
            action={
              <Button to="/stories" variant="outline" size="sm" icon={ArrowRight}>
                Baca Cerita Lainnya
              </Button>
            }
          />

          <div className="grid-3">
            {testimonials.map((testi) => (
              <TestimonialCard key={testi.id} testimonial={testi} />
            ))}
          </div>
        </div>
      </section>

      {/* 9. Latest Articles & Knowledge Center */}
      <section className="section-py" style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="コラム・情報発信"
            categoryTag="ARTIKEL & WAWASAN"
            title="Wawasan Bahasa, Budaya Kerja, dan Persiapan Hidup di Jepang"
            subtitle="Artikel terkurasi dari para sensei dan praktisi penempatan untuk memperkaya persiapan studi dan kariermu."
            action={
              <Button to="/articles" variant="outline" size="sm" icon={Newspaper} iconPosition="left">
                Semua Artikel
              </Button>
            }
          />

          <div className="grid-3">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ Section */}
      <section className="section-py" style={{ backgroundColor: 'var(--bg-canvas)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="よくある質問"
            categoryTag="PERTANYAAN UMUM"
            title="Hal yang Sering Ditanyakan Mengenai Pelatihan & Pendaftaran"
            subtitle="Transparansi adalah komitmen kami. Temukan jawaban seputar program, biaya, asrama, dan mekanisme penempatan."
            alignment="center"
          />

          <div style={{ maxWidth: '840px', margin: '0 auto' }}>
            <FAQAccordion items={faqs} />
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/faq" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--vermilion)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Punya pertanyaan lain? Lihat halaman FAQ lengkap</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Registration CTA */}
      <CTASection />
    </div>
  );
}
