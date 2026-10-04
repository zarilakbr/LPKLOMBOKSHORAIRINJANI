import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft, Send, Sparkles, AlertCircle } from 'lucide-react';
import SectionHeading from '../../components/common/SectionHeading';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { registrationService, programService } from '../../services/dataService';
import { BRAND } from '../../config/brand';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const preSelectedProgram = searchParams.get('program') || '';
  const preSelectedGoal = searchParams.get('goal') || '';

  const [programsList, setProgramsList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    education: 'SMA/SMK',
    city: '',
    programInterest: preSelectedProgram || 'Bahasa Jepang Dasar (N5)',
    japaneseLevel: 'Belum Pernah Belajar (Nol)',
    japanGoal: preSelectedGoal || 'Bekerja Tokutei Ginou (SSW)',
    message: ''
  });

  useEffect(() => {
    programService.getAll().then((data) => setProgramsList(data));
  }, []);

  useEffect(() => {
    if (preSelectedProgram) {
      setFormData((prev) => ({ ...prev, programInterest: preSelectedProgram }));
    }
    if (preSelectedGoal) {
      setFormData((prev) => ({ ...prev, japanGoal: preSelectedGoal }));
    }
  }, [preSelectedProgram, preSelectedGoal]);

  const validate = () => {
    const err = {};
    if (!formData.fullName.trim()) err.fullName = 'Nama lengkap wajib diisi.';
    if (!formData.email.trim()) {
      err.email = 'Alamat email wajib diisi.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      err.email = 'Format email tidak valid.';
    }
    if (!formData.phone.trim()) {
      err.phone = 'Nomor WhatsApp wajib diisi.';
    } else if (formData.phone.length < 9) {
      err.phone = 'Nomor WhatsApp minimal 9 digit.';
    }
    if (!formData.dob) err.dob = 'Tanggal lahir wajib diisi.';
    if (!formData.city.trim()) err.city = 'Kota domisili saat ini wajib diisi.';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);
    try {
      const res = await registrationService.submit(formData);
      setSubmitResult(res);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        (error.response?.data?.errors ? Object.values(error.response.data.errors)[0]?.[0] : null) ||
        error.message ||
        'Pendaftaran gagal dikirim ke server backend.';
      setApiError(errorMsg);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="section-py-sm" style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container-narrow">
          <SectionHeading
            jpSubtitle="受講申込み"
            categoryTag="PENDAFTARAN ANGKATAN BARU"
            title={`Formulir Pendaftaran Siswa Baru ${BRAND.name}`}
            subtitle="Lengkapi data diri Anda di bawah ini secara teliti. Tim admisi kami akan menghubungi Anda untuk verifikasi dokumen dan jadwal sesi orientasi."
            alignment="center"
          />

          {submitResult ? (
            <div
              className="card-editorial"
              style={{
                padding: '3.5rem 2.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  backgroundColor: 'var(--emerald-subtle)',
                  color: 'var(--emerald)',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto'
                }}
              >
                <CheckCircle2 size={42} />
              </div>

              <Badge variant="emerald" style={{ marginBottom: '1rem' }}>
                Nomor Registrasi: {submitResult.registrationId}
              </Badge>

              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Pendaftaran Berhasil Dikirim!
              </h2>

              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
                {submitResult.message}
              </p>

              <div
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  maxWidth: '520px',
                  margin: '0 auto 2.5rem auto',
                  textAlign: 'left',
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  Ringkasan Data yang Didaftarkan:
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Nama:</span>
                  <span style={{ fontWeight: 600 }}>{formData.fullName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Program Dipilih:</span>
                  <span style={{ fontWeight: 600 }}>{formData.programInterest}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target Karier:</span>
                  <span style={{ fontWeight: 600 }}>{formData.japanGoal}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <Button to="/" variant="outline">
                  Kembali ke Beranda
                </Button>
                <Button
                  to="/contact"
                  variant="primary"
                >
                  Hubungi Kantor LPK
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="card-editorial"
              style={{
                padding: '2.5rem',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              {apiError && (
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    marginBottom: '1.5rem',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: 'var(--radius-sm)',
                    color: '#B91C1C',
                    fontSize: '0.92rem',
                    fontWeight: 600
                  }}
                >
                  {apiError}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                {/* 1. Data Pribadi */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                    <span style={{ width: '24px', height: '24px', backgroundColor: 'var(--vermilion)', color: '#FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                      1
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Identitas Pribadi</h3>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nama Lengkap (Sesuai KTP / Paspor) *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Masukkan nama lengkap Anda"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                    {errors.fullName && <span style={{ color: 'var(--vermilion)', fontSize: '0.8rem' }}>{errors.fullName}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-responsive-2">
                    <div className="form-group">
                      <label className="form-label">Alamat Email Aktif *</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="contoh@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                      {errors.email && <span style={{ color: 'var(--vermilion)', fontSize: '0.8rem' }}>{errors.email}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">No. WhatsApp / HP Aktif *</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="0812xxxxxxxx"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                      {errors.phone && <span style={{ color: 'var(--vermilion)', fontSize: '0.8rem' }}>{errors.phone}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-responsive-2">
                    <div className="form-group">
                      <label className="form-label">Tanggal Lahir *</label>
                      <input
                        type="date"
                        className="form-input"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      />
                      {errors.dob && <span style={{ color: 'var(--vermilion)', fontSize: '0.8rem' }}>{errors.dob}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Kota / Domisili Saat Ini *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Contoh: Jakarta, Surabaya, Lombok, Bandung"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                      {errors.city && <span style={{ color: 'var(--vermilion)', fontSize: '0.8rem' }}>{errors.city}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pendidikan Terakhir</label>
                    <select
                      className="form-select"
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    >
                      <option value="SMA/SMK">SMA / SMK Sederajat</option>
                      <option value="Diploma 3 (D3)">Diploma (D3)</option>
                      <option value="Sarjana (S1)">Sarjana (S1 / D4)</option>
                      <option value="Magister (S2)">Magister (S2)</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                {/* 2. Peminatan Program & Kemampuan Bahasa */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                    <span style={{ width: '24px', height: '24px', backgroundColor: 'var(--vermilion)', color: '#FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                      2
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Pilihan Program & Target Karier</h3>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pilihan Program Pelatihan *</label>
                    <select
                      className="form-select"
                      value={formData.programInterest}
                      onChange={(e) => setFormData({ ...formData, programInterest: e.target.value })}
                    >
                      {programsList.map((prog) => (
                        <option key={prog.id} value={prog.title}>
                          {prog.title} ({prog.level})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-responsive-2">
                    <div className="form-group">
                      <label className="form-label">Tingkat Kemampuan Bahasa Jepang Saat Ini</label>
                      <select
                        className="form-select"
                        value={formData.japaneseLevel}
                        onChange={(e) => setFormData({ ...formData, japaneseLevel: e.target.value })}
                      >
                        <option value="Belum Pernah Belajar (Nol)">Belum Pernah Belajar (Mulai dari Nol)</option>
                        <option value="Sudah Hafal Hiragana/Katakana">Sudah Hafal Hiragana & Katakana</option>
                        <option value="Pernah Belajar Dasar N5">Pernah Belajar Tingkat N5</option>
                        <option value="Memiliki Sertifikat N5 / N4">Sudah Memiliki Sertifikat N5 / N4</option>
                        <option value="Tingkat N3 ke Atas">Tingkat Lanjutan (N3 ke Atas)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tujuan / Sektor Kerja Impian di Jepang</label>
                      <select
                        className="form-select"
                        value={formData.japanGoal}
                        onChange={(e) => setFormData({ ...formData, japanGoal: e.target.value })}
                      >
                        <option value="Caregiver / Perawat Lansia (Kaigo)">Caregiver / Perawat Lansia (Kaigo)</option>
                        <option value="Manufaktur & Permesinan (Seizou)">Manufaktur Otomotif & Mesin</option>
                        <option value="Pengolahan Makanan (Food Service)">Pengolahan Makanan & Minuman</option>
                        <option value="Pertanian Modern (Nogyo)">Pertanian & Hortikultura</option>
                        <option value="Perhotelan & Pariwisata (Hospitality)">Perhotelan & Resort (Hospitality)</option>
                        <option value="Konstruksi & Teknik (Kensetsu)">Konstruksi & Interior</option>
                        <option value="Staf Profesional / IT (Visa Gijinkoku)">Staf Profesional / IT (Gijinkoku)</option>
                        <option value="Belajar Bahasa Saja (Pendidikan)">Fokus Belajar Bahasa Saja</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Catatan Tambahan / Motivasi (Opsional)</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Ceritakan motivasi atau pertanyaan spesifik yang ingin Anda sampaikan..."
                      rows="3"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                </div>

                <div
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '2rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <ShieldCheck size={20} color="var(--vermilion)" style={{ flexShrink: 0 }} />
                  <span>
                    Data Anda dilindungi kerahasiaannya dan hanya dipergunakan untuk proses pendaftaran serta bimbingan resmi di {BRAND.name}.
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submitting}
                  icon={ArrowRight}
                  style={{ width: '100%' }}
                >
                  {submitting ? 'Memproses Pendaftaran...' : 'Kirim Pendaftaran Siswa Baru'}
                </Button>
              </form>
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .grid-responsive-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
