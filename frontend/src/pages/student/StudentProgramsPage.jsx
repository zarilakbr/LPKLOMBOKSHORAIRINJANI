import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react';
import { programService } from '../../services/dataService';
import { BRAND } from '../../config/brand';
import Button from '../../components/common/Button';

export default function StudentProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    programService.getAll().then((data) => {
      setPrograms(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Program Pelatihan
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
          Daftar silabus kurikulum dan program persiapan karier bahasa Jepang yang tersedia.
        </p>
      </div>

      {loading ? (
        <div className="student-card" style={{ textAlign: 'center', padding: '3rem' }}>
          Memuat program pelatihan...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {programs.map((prog) => (
            <div key={prog.id} className="student-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--vermilion)', fontSize: '0.82rem', fontWeight: 700 }}>
                  <Clock size={15} />
                  <span>{prog.duration} • {prog.targetLevel}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                  {prog.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                  {prog.shortDescription}
                </p>
              </div>

              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                <Button
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo ${BRAND.name}, saya ingin konsultasi mengenai program ${prog.title}, jadwal pendaftaran, dan informasi biayanya.`)}`}
                  variant="primary"
                  size="sm"
                  icon={MessageCircle}
                >
                  Konsultasi via WhatsApp
                </Button>
                <Button to={`/programs/${prog.slug}`} variant="outline" size="sm" icon={ArrowRight}>
                  Detail Kurikulum
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
