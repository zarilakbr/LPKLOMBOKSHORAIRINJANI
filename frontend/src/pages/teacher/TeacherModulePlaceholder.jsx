import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { BookOpen, Calendar, Users, ClipboardCheck, User, Settings, GraduationCap, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

export default function TeacherModulePlaceholder({ title, description, icon: Icon = BookOpen }) {
  const location = useLocation();

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            {description}
          </p>
        </div>

        <Button to="/teacher/dashboard" variant="outline" size="sm" icon={ArrowLeft} iconPosition="left">
          Kembali ke Dashboard
        </Button>
      </div>

      <div className="student-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--ochre-subtle)',
            color: 'var(--ochre)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}
        >
          <Icon size={28} />
        </div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Modul {title} Aktif
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
          Arsitektur portal pengajar untuk {title.toLowerCase()} telah terintegrasi dengan role PENGAJAR. Data akan tersinkronisasi langsung dengan sistem presensi dan kurikulum backend.
        </p>
      </div>
    </div>
  );
}
