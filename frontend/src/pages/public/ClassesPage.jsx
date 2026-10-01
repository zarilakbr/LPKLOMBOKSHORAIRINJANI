import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin, UserCheck, Users, ArrowRight, ShieldAlert } from 'lucide-react';
import SectionHeading from '../../components/common/SectionHeading';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CTASection from '../../components/common/CTASection';
import { classService } from '../../services/dataService';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    classService.getAll().then((data) => setClasses(data));
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="emerald">Pendaftaran Dibuka</Badge>;
      case 'FULL':
        return <Badge variant="vermilion">Kuota Penuh</Badge>;
      case 'UPCOMING':
        return <Badge variant="ochre">Akan Datang</Badge>;
      case 'ONGOING':
        return <Badge variant="navy">Sedang Berjalan</Badge>;
      default:
        return <Badge variant="navy">{status}</Badge>;
    }
  };

  return (
    <div>
      <section className="section-py-sm" style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <SectionHeading
            jpSubtitle="開講スケジュール"
            categoryTag="JADWAL & KUOTA ANGKATAN"
            title="Jadwal Kelas Aktif & Pembukaan Angkatan Baru"
            subtitle="Perhatikan ketersediaan kuota kelas per batch. Demi efektivitas dan interaksi maksimal, setiap kelas dibatasi maksimal 15-20 siswa."
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
            {classes.map((cls) => {
              const seatsLeft = cls.capacity - cls.currentStudents;
              const isFull = seatsLeft <= 0;
              const percentFilled = Math.round((cls.currentStudents / cls.capacity) * 100);

              return (
                <div
                  key={cls.id}
                  className="card-editorial class-card-grid"
                  style={{
                    padding: '2rem',
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr 0.6fr',
                    alignItems: 'center',
                    gap: '2rem'
                  }}
                >
                  {/* Info Column */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      {getStatusBadge(cls.status)}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cls.level}</span>
                    </div>

                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                      {cls.className}
                    </h3>

                    <div style={{ fontSize: '0.92rem', color: 'var(--vermilion)', fontWeight: 600, marginBottom: '0.75rem' }}>
                      {cls.programTitle}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <UserCheck size={16} color="var(--vermilion)" />
                      <span>Pengajar: {cls.instructor}</span>
                    </div>
                  </div>

                  {/* Schedule & Location */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} color="var(--vermilion)" />
                      <span>{cls.schedule}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CalendarDays size={16} color="var(--vermilion)" />
                      <span>{cls.startDate} s.d {cls.endDate}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} color="var(--vermilion)" />
                      <span>{cls.location}</span>
                    </div>
                  </div>

                  {/* Seat Progress & CTA */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', maxWidth: '180px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                        <span>Terisi: {cls.currentStudents}/{cls.capacity}</span>
                        <span style={{ color: isFull ? 'var(--vermilion)' : 'var(--emerald)' }}>
                          {isFull ? 'Penuh' : `Sisa ${seatsLeft}`}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percentFilled}%`,
                            height: '100%',
                            backgroundColor: isFull ? 'var(--vermilion)' : percentFilled > 75 ? 'var(--ochre)' : 'var(--emerald)',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                    </div>

                    <Button
                      to={`/register?batch=${encodeURIComponent(cls.className)}&program=${encodeURIComponent(cls.programTitle)}`}
                      variant={isFull ? 'outline' : 'primary'}
                      size="sm"
                      disabled={isFull}
                      icon={ArrowRight}
                    >
                      {isFull ? 'Waiting List' : 'Daftar Batch'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection
        title="Ingin Jadwal Fleksibel atau Kelas Privat?"
        subtitle="Kami juga menyediakan opsi kelas malam eksekutif (Night Class) dan bimbingan privat 1-on-1 intensif."
      />

      <style>{`
        @media (max-width: 900px) {
          .class-card-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          .class-card-grid > div:last-child {
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
}
