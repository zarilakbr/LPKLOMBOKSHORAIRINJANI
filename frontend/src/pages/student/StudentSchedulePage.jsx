import React from 'react';
import { Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';

export default function StudentSchedulePage() {
  const scheduleItems = [
    {
      id: 1,
      day: 'Senin, Rabu, Jumat',
      time: '08.30 – 12.00 WITA',
      course: 'Bahasa Jepang Dasar (N5) - Sesi Teori & Gramatika',
      room: 'Dojo Rinjani A-101',
      sensei: 'Sensei Kenjiro Tanaka'
    },
    {
      id: 2,
      day: 'Selasa & Kamis',
      time: '13.30 – 16.00 WITA',
      course: 'Drilling Kanji, Choukai (Listening) & Daily Kaiwa',
      room: 'Lab Bahasa Komputer B-202',
      sensei: 'Sensei Rina Puspita'
    },
    {
      id: 3,
      day: 'Sabtu',
      time: '09.00 – 11.30 WITA',
      course: 'Simulasi Etos Kerja & Budaya Industri Jepang (Hou-Ren-So)',
      room: 'Aula Lombok Shorai Center',
      sensei: 'Sensei Kenjiro Tanaka'
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Jadwal Pelatihan Saya
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
          Jadwal tatap muka, simulasi lab bahasa, dan pembekalan budaya kerja Anda.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {scheduleItems.map((item) => (
          <div key={item.id} className="student-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--vermilion)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <Calendar size={16} />
              <span>{item.day}</span>
              <span>•</span>
              <Clock size={16} />
              <span>{item.time}</span>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {item.course}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={15} color="var(--text-muted)" />
                <span>{item.room}</span>
              </div>
              <div>
                Pengampu: <strong>{item.sensei}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
