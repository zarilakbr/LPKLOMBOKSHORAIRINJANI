import React, { useState, useEffect } from 'react';
import {
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Printer,
  Eye,
  Edit3,
  Save,
  Clock,
  Sparkles
} from 'lucide-react';
import FormField from '../../components/admin/FormField';
import ResumePhotoUpload from '../../components/common/ResumePhotoUpload';
import JapaneseResumePrintView from '../../components/resume/JapaneseResumePrintView';
import { resumeService, studentAuthService } from '../../services/dataService';
import {
  GENDER_OPTIONS,
  BLOOD_TYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  SMOKING_OPTIONS,
  ALCOHOL_OPTIONS,
  TATTOO_OPTIONS,
  COLOR_BLINDNESS_OPTIONS,
  PASSPORT_OPTIONS,
  JAPAN_FAMILY_OPTIONS,
  RELIGION_OPTIONS,
  FAMILY_RELATION_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  COMMON_OCCUPATION_OPTIONS,
  YES_NO_OPTIONS,
  calculateAge,
  transliterateToKatakana,
  generateJapaneseResumeData
} from '../../utils/japaneseResumeHelper';

export default function StudentResumePage() {
  const currentUser = studentAuthService.getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [activeView, setActiveView] = useState('form'); // 'form' | 'preview'

  const [resumeId, setResumeId] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [registerNo, setRegisterNo] = useState('');
  const [resumeStatus, setResumeStatus] = useState('DRAFT');

  const [formData, setFormData] = useState({
    name: '',
    kana_name: '',
    romaji_name: '',
    gender: 'Laki-laki',
    pob: '',
    dob: '',
    height: '',
    weight: '',
    blood_type: 'O',
    address: '',
    tattoo: 'Tidak ada',
    color_blindness: 'Normal / Tidak buta warna',
    marital_status: 'Belum menikah',
    smoking: 'Tidak merokok',
    alcohol: 'Tidak minum alkohol',
    passport: 'Tidak ada / Belum ada',
    japan_family: 'Tidak ada',
    study_duration_months: '6',
    religion: 'Islam',

    education: [
      {
        level: 'SMA',
        school_name: '',
        period_start: '2019-07',
        period_end: '2022-06',
        major: 'IPS'
      }
    ],

    work_experience: [],

    family: [
      { relation: 'Ayah', name: '', age: '', occupation: 'Petani' },
      { relation: 'Ibu', name: '', age: '', occupation: 'Ibu Rumah Tangga' }
    ],

    q_waist_problem: 'Tidak',
    q_illness_surgery: 'Tidak',
    q_family_tbc: 'Tidak',
    q_rules_compliance: 'Ya',
    q_pass_n4_confident: 'Ya',

    hobbies: 'Badminton, Membaca buku',
    skills: 'Percakapan Bahasa Jepang dasar, Disiplin waktu',
    strengths: 'Jujur, rajin, disiplin, dan pantang menyerah dalam menghadapi tantangan.',
    weaknesses: 'Terkadang terlalu hati-hati, namun saya selalu mencatat dan memeriksa kembali pekerjaan.',
    savings_target: '300 Juta Rupiah',
    reason_for_japan: 'Ingin mempelajari etos kerja dan teknologi Jepang, mandiri secara finansial, serta membantu meningkatkan perekonomian keluarga di tanah air.'
  });

  const [japaneseData, setJapaneseData] = useState(null);

  const loadResume = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await resumeService.getMyResume();
      if (data) {
        setResumeId(data.id || null);
        setRegisterNo(data.register_no || `REG-${new Date().getFullYear()}-${String(currentUser?.id || 1).padStart(4, '0')}`);
        setProfilePhoto(data.profile_photo || currentUser?.avatar || '');
        setResumeStatus(data.status || 'DRAFT');

        if (data.data_id) {
          setFormData((prev) => ({
            ...prev,
            ...data.data_id,
            name: data.data_id.name || currentUser?.name || '',
            romaji_name: data.data_id.romaji_name || currentUser?.name || ''
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            name: currentUser?.name || '',
            romaji_name: currentUser?.name || ''
          }));
        }

        if (data.data_jp) {
          setJapaneseData(data.data_jp);
        }
      }
    } catch (err) {
      console.error('Failed to load student resume:', err);
      setFeedback({ type: 'error', message: 'Gagal memuat resume siswa.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResume();
  }, []);

  // Update Katakana when name changes if empty
  const handleNameChange = (val) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      romaji_name: val,
      kana_name: prev.kana_name ? prev.kana_name : transliterateToKatakana(val)
    }));
  };

  // Education Helpers
  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { level: 'SMA', school_name: '', period_start: '', period_end: '', major: '' }
      ]
    }));
  };

  const handleRemoveEducation = (idx) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx)
    }));
  };

  const handleEducationChange = (idx, field, val) => {
    setFormData((prev) => {
      const copy = [...prev.education];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, education: copy };
    });
  };

  // Work Experience Helpers
  const handleAddWork = () => {
    setFormData((prev) => ({
      ...prev,
      work_experience: [
        ...prev.work_experience,
        { company_name: '', period_start: '', period_end: '', job_type: '' }
      ]
    }));
  };

  const handleRemoveWork = (idx) => {
    setFormData((prev) => ({
      ...prev,
      work_experience: prev.work_experience.filter((_, i) => i !== idx)
    }));
  };

  const handleWorkChange = (idx, field, val) => {
    setFormData((prev) => {
      const copy = [...prev.work_experience];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, work_experience: copy };
    });
  };

  // Family Helpers
  const handleAddFamily = () => {
    setFormData((prev) => ({
      ...prev,
      family: [
        ...prev.family,
        { relation: 'Adik Laki-laki', name: '', age: '', occupation: 'Pelajar / Mahasiswa' }
      ]
    }));
  };

  const handleRemoveFamily = (idx) => {
    setFormData((prev) => ({
      ...prev,
      family: prev.family.filter((_, i) => i !== idx)
    }));
  };

  const handleFamilyChange = (idx, field, val) => {
    setFormData((prev) => {
      const copy = [...prev.family];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, family: copy };
    });
  };

  // Save Resume (Draft or Completed)
  const handleSave = async (statusToSet = 'COMPLETED') => {
    if (!formData.name?.trim()) {
      setFeedback({ type: 'error', message: 'Nama lengkap wajib diisi.' });
      return;
    }
    if (!formData.dob) {
      setFeedback({ type: 'error', message: 'Tanggal lahir wajib diisi untuk menghitung umur dan tanggal format Jepang.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      // Auto-generate Japanese translation data
      const generatedJp = generateJapaneseResumeData(
        { ...formData, register_no: registerNo },
        profilePhoto
      );

      const payload = {
        register_no: registerNo,
        profile_photo: profilePhoto,
        data_id: formData,
        data_jp: generatedJp,
        status: statusToSet
      };

      const res = await resumeService.saveMyResume(payload);
      setResumeId(res?.id || resumeId);
      setResumeStatus(statusToSet);
      setJapaneseData(generatedJp);

      setFeedback({
        type: 'success',
        message:
          statusToSet === 'COMPLETED'
            ? 'Resume Jepang (履歴書) berhasil disimpan dan siap dicetak!'
            : 'Draf resume berhasil disimpan.'
      });
    } catch (err) {
      console.error('Failed to save resume:', err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal menyimpan resume.';
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setSaving(false);
    }
  };

  const calculatedAge = calculateAge(formData.dob);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Clock className="spin-slow" size={32} style={{ margin: '0 auto 0.5rem auto' }} />
        <div>Memuat formulir resume Jepang siswa...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            Resume / 履歴書 (Rirekisho)
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Lengkapi data diri dalam bahasa Indonesia. Sistem akan otomatis menerjemahkan dan memformat dokumen standar resume Jepang (A4 siap cetak).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={() => setActiveView(activeView === 'form' ? 'preview' : 'form')}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {activeView === 'form' ? (
              <>
                <Eye size={15} /> Lihat Pratinjau Dokumen Cetak (A4)
              </>
            ) : (
              <>
                <Edit3 size={15} /> Kembali ke Formulir
              </>
            )}
          </button>

          {activeView === 'form' && (
            <>
              <button
                type="button"
                onClick={() => handleSave('DRAFT')}
                disabled={saving}
                className="btn btn-outline btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Save size={14} /> Simpan Draf
              </button>
              <button
                type="button"
                onClick={() => handleSave('COMPLETED')}
                disabled={saving}
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <CheckCircle2 size={15} /> {saving ? 'Menyimpan...' : 'Simpan & Lengkapi'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: feedback.type === 'success' ? '#16A34A' : '#EF4444',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{feedback.message}</span>
        </div>
      )}

      {/* VIEW 1: PRINTABLE PREVIEW */}
      {activeView === 'preview' ? (
        <JapaneseResumePrintView
          dataId={formData}
          dataJp={japaneseData || generateJapaneseResumeData({ ...formData, register_no: registerNo }, profilePhoto)}
          user={currentUser}
          profilePhoto={profilePhoto || currentUser?.avatar || ''}
          onBack={() => setActiveView('form')}
        />
      ) : (
        /* VIEW 2: FORM INPUTS */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section A: Header & Foto Profil 3x4 */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <Sparkles size={18} style={{ color: 'var(--vermilion)' }} />
              <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                A. Header & Foto Profil 3x4
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <FormField
                  label="Nomor Register Siswa (登録番号)"
                  value={registerNo}
                  onChange={(e) => setRegisterNo(e.target.value)}
                  placeholder="Contoh: REG-2026-0042"
                  helpText="Nomor registrasi unik siswa di LPK."
                />

                <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong>Tanggal Pembuatan (作成日):</strong> Hari ini (otomatis tercetak sesuai format kalender Jepang).
                </div>
              </div>

              <div>
                <ResumePhotoUpload
                  label="Unggah Pasfoto Formal Siswa (3x4)"
                  value={profilePhoto}
                  onChange={(val) => setProfilePhoto(val)}
                  helpText="Unggah file foto formal latar belakang polos (standar pasfoto Jepang 3cm x 4cm). Foto otomatis disimpan dan dicetak di resume."
                />
              </div>
            </div>
          </div>

          {/* Section B: Data Diri Siswa */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <User size={18} style={{ color: 'var(--vermilion)' }} />
              <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                B. Data Diri Siswa (個人情報)
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <FormField
                label="Nama Lengkap (Alfabet) *"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Contoh: Budi Santoso"
              />

              <FormField
                label="Nama dalam Katakana (カナ)"
                value={formData.kana_name}
                onChange={(e) => setFormData({ ...formData, kana_name: e.target.value })}
                placeholder="Contoh: ブディ・サントソ"
                helpText="Dibuat otomatis dari nama latin (bisa disesuaikan)."
              />

              <FormField
                label="Jenis Kelamin (性別) *"
                type="select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                options={GENDER_OPTIONS}
              />

              <FormField
                label="Tanggal Lahir (生年月日) *"
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                helpText={calculatedAge.age > 0 ? `Umur otomatis: ${calculatedAge.textJp}` : ''}
              />

              <FormField
                label="Tempat Lahir (出生地) *"
                value={formData.pob}
                onChange={(e) => setFormData({ ...formData, pob: e.target.value })}
                placeholder="Contoh: Mataram, Lombok"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormField
                  label="Tinggi Badan (cm)"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="168"
                />
                <FormField
                  label="Berat Badan (kg)"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="60"
                />
              </div>

              <FormField
                label="Golongan Darah (血液型)"
                type="select"
                value={formData.blood_type}
                onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                options={BLOOD_TYPE_OPTIONS}
              />

              <FormField
                label="Agama (宗教)"
                type="select"
                value={formData.religion}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                options={RELIGION_OPTIONS}
              />

              <FormField
                label="Masa Belajar B. Jepang (Bulan)"
                type="number"
                value={formData.study_duration_months}
                onChange={(e) => setFormData({ ...formData, study_duration_months: e.target.value })}
                placeholder="6"
              />

              <FormField
                label="Status Pernikahan (配偶者)"
                type="select"
                value={formData.marital_status}
                onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                options={MARITAL_STATUS_OPTIONS}
              />

              <FormField
                label="Kebiasaan Merokok (喫煙)"
                type="select"
                value={formData.smoking}
                onChange={(e) => setFormData({ ...formData, smoking: e.target.value })}
                options={SMOKING_OPTIONS}
              />

              <FormField
                label="Kebiasaan Alkohol (飲酒)"
                type="select"
                value={formData.alcohol}
                onChange={(e) => setFormData({ ...formData, alcohol: e.target.value })}
                options={ALCOHOL_OPTIONS}
              />

              <FormField
                label="Tato Tubuh (入れ墨)"
                type="select"
                value={formData.tattoo}
                onChange={(e) => setFormData({ ...formData, tattoo: e.target.value })}
                options={TATTOO_OPTIONS}
              />

              <FormField
                label="Kondisi Buta Warna (色覚)"
                type="select"
                value={formData.color_blindness}
                onChange={(e) => setFormData({ ...formData, color_blindness: e.target.value })}
                options={COLOR_BLINDNESS_OPTIONS}
              />

              <FormField
                label="Kepemilikan Paspor (パスポート)"
                type="select"
                value={formData.passport}
                onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
                options={PASSPORT_OPTIONS}
              />

              <FormField
                label="Keluarga / Kerabat di Jepang (在日家族)"
                type="select"
                value={formData.japan_family}
                onChange={(e) => setFormData({ ...formData, japan_family: e.target.value })}
                options={JAPAN_FAMILY_OPTIONS}
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <FormField
                label="Alamat Lengkap Domisili (住所) *"
                type="textarea"
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Contoh: Jl. Raya Abdul Aziz No. 99, Dusun Parwa, Dasan Tapen, Kec. Gerung, Kab. Lombok Barat, NTB"
              />
            </div>
          </div>

          {/* Section C: Riwayat Pendidikan (学歴) */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap size={18} style={{ color: 'var(--vermilion)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  C. Riwayat Pendidikan (学歴)
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="btn btn-outline btn-xs"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Plus size={13} /> Tambah Baris Pendidikan
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formData.education.map((edu, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem',
                    backgroundColor: 'var(--bg-surface-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      Pendidikan #{idx + 1}
                    </span>
                    {formData.education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}
                        title="Hapus baris ini"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    <FormField
                      label="Jenjang Pendidikan"
                      type="select"
                      value={edu.level}
                      onChange={(e) => handleEducationChange(idx, 'level', e.target.value)}
                      options={EDUCATION_LEVEL_OPTIONS}
                    />

                    <FormField
                      label="Nama Sekolah / Kampus"
                      value={edu.school_name}
                      onChange={(e) => handleEducationChange(idx, 'school_name', e.target.value)}
                      placeholder="Contoh: SMAN 1 Gerung"
                    />

                    <FormField
                      label="Bulan Masuk (YYYY-MM)"
                      type="month"
                      value={edu.period_start}
                      onChange={(e) => handleEducationChange(idx, 'period_start', e.target.value)}
                    />

                    <FormField
                      label="Bulan Lulus (YYYY-MM)"
                      type="month"
                      value={edu.period_end}
                      onChange={(e) => handleEducationChange(idx, 'period_end', e.target.value)}
                    />

                    <FormField
                      label="Jurusan / Konsentrasi"
                      value={edu.major}
                      onChange={(e) => handleEducationChange(idx, 'major', e.target.value)}
                      placeholder="Contoh: IPA / Mesin / Akuntansi"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section D: Pengalaman Kerja (職歴) */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={18} style={{ color: 'var(--vermilion)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  D. Pengalaman Kerja (職歴)
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddWork}
                className="btn btn-outline btn-xs"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Plus size={13} /> Tambah Baris Pengalaman
              </button>
            </div>

            {formData.work_experience.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Belum ada pengalaman kerja ditambahkan. (Jika belum pernah bekerja, boleh dikosongkan).
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {formData.work_experience.map((work, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem',
                      backgroundColor: 'var(--bg-surface-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        Pengalaman Kerja #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWork(idx)}
                        style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}
                        title="Hapus baris ini"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      <FormField
                        label="Nama Perusahaan / Tempat Usaha"
                        value={work.company_name}
                        onChange={(e) => handleWorkChange(idx, 'company_name', e.target.value)}
                        placeholder="Contoh: PT. Sumber Makmur Abadi"
                      />

                      <FormField
                        label="Bulan Masuk (YYYY-MM)"
                        type="month"
                        value={work.period_start}
                        onChange={(e) => handleWorkChange(idx, 'period_start', e.target.value)}
                      />

                      <FormField
                        label="Bulan Keluar (YYYY-MM)"
                        type="month"
                        value={work.period_end}
                        onChange={(e) => handleWorkChange(idx, 'period_end', e.target.value)}
                      />

                      <FormField
                        label="Jenis Pekerjaan / Posisi"
                        value={work.job_type}
                        onChange={(e) => handleWorkChange(idx, 'job_type', e.target.value)}
                        placeholder="Contoh: Operator Produksi / Staff"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section E: Susunan Keluarga (家族構成) */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={18} style={{ color: 'var(--vermilion)' }} />
                <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  E. Susunan Keluarga (家族構成)
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddFamily}
                className="btn btn-outline btn-xs"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Plus size={13} /> Tambah Anggota Keluarga
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formData.family.map((fam, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.85rem',
                    backgroundColor: 'var(--bg-surface-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      Keluarga #{idx + 1}
                    </span>
                    {formData.family.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFamily(idx)}
                        style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}
                        title="Hapus baris ini"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <FormField
                      label="Hubungan Keluarga"
                      type="select"
                      value={fam.relation}
                      onChange={(e) => handleFamilyChange(idx, 'relation', e.target.value)}
                      options={FAMILY_RELATION_OPTIONS}
                    />

                    <FormField
                      label="Nama Anggota Keluarga"
                      value={fam.name}
                      onChange={(e) => handleFamilyChange(idx, 'name', e.target.value)}
                      placeholder="Contoh: H. Ahmad Subagio"
                    />

                    <FormField
                      label="Umur (Tahun)"
                      type="number"
                      value={fam.age}
                      onChange={(e) => handleFamilyChange(idx, 'age', e.target.value)}
                      placeholder="52"
                    />

                    <FormField
                      label="Pekerjaan"
                      type="select"
                      value={fam.occupation}
                      onChange={(e) => handleFamilyChange(idx, 'occupation', e.target.value)}
                      options={COMMON_OCCUPATION_OPTIONS}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section F: Pertanyaan Kesehatan, Komitmen & Karakter */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <FileText size={18} style={{ color: 'var(--vermilion)' }} />
              <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                F. Konfirmasi Kesehatan, Karakter & Motivasi (自己PR)
              </h2>
            </div>

            {/* 5 Pertanyaan Ya/Tidak */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Pertanyaan Kesehatan & Pernyataan Komitmen (Wajib Diisi):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                <FormField
                  label="1. Ada masalah pinggang / organ tubuh lain?"
                  type="select"
                  value={formData.q_waist_problem}
                  onChange={(e) => setFormData({ ...formData, q_waist_problem: e.target.value })}
                  options={YES_NO_OPTIONS}
                />
                <FormField
                  label="2. Ada riwayat penyakit berat / operasi?"
                  type="select"
                  value={formData.q_illness_surgery}
                  onChange={(e) => setFormData({ ...formData, q_illness_surgery: e.target.value })}
                  options={YES_NO_OPTIONS}
                />
                <FormField
                  label="3. Ada keluarga yang terkena TBC?"
                  type="select"
                  value={formData.q_family_tbc}
                  onChange={(e) => setFormData({ ...formData, q_family_tbc: e.target.value })}
                  options={YES_NO_OPTIONS}
                />
                <FormField
                  label="4. Sanggup mematuhi hukum & aturan perusahaan Jepang?"
                  type="select"
                  value={formData.q_rules_compliance}
                  onChange={(e) => setFormData({ ...formData, q_rules_compliance: e.target.value })}
                  options={YES_NO_OPTIONS}
                />
                <FormField
                  label="5. Yakin lulus ujian N4 sebelum berangkat?"
                  type="select"
                  value={formData.q_pass_n4_confident}
                  onChange={(e) => setFormData({ ...formData, q_pass_n4_confident: e.target.value })}
                  options={YES_NO_OPTIONS}
                />
              </div>
            </div>

            {/* Karakter, Hobi, Alasan */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FormField
                label="Hobi (趣味)"
                value={formData.hobbies}
                onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                placeholder="Contoh: Badminton, membaca, memasak"
              />

              <FormField
                label="Keahlian Khusus (特技)"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="Contoh: Komunikasi bahasa Jepang, kelistrikan"
              />

              <FormField
                label="Kelebihan Diri (長所)"
                type="textarea"
                rows={2}
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                placeholder="Contoh: Disiplin waktu, pantang menyerah, ramah"
              />

              <FormField
                label="Kekurangan Diri (短所)"
                type="textarea"
                rows={2}
                value={formData.weaknesses}
                onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                placeholder="Contoh: Terkadang terburu-buru, namun saya selalu mencatat dan cek ulang"
              />
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <FormField
                label="Target Tabungan Selama Bekerja di Jepang (目標貯金額)"
                value={formData.savings_target}
                onChange={(e) => setFormData({ ...formData, savings_target: e.target.value })}
                placeholder="Contoh: 300 Juta Rupiah"
              />

              <FormField
                label="Alasan Ingin Bekerja di Jepang (志望理由) *"
                type="textarea"
                rows={3}
                required
                value={formData.reason_for_japan}
                onChange={(e) => setFormData({ ...formData, reason_for_japan: e.target.value })}
                placeholder="Jelaskan motivasi Anda bekerja di Jepang, tujuan karier, dan kontribusi bagi keluarga/daerah..."
              />
            </div>
          </div>

          {/* Action Bar Bottom */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '1rem'
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Status Resume: <strong>{resumeStatus}</strong>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setActiveView('preview')}
                className="btn btn-outline btn-sm"
              >
                Pratinjau Cetak A4
              </button>
              <button
                type="button"
                onClick={() => handleSave('DRAFT')}
                disabled={saving}
                className="btn btn-outline btn-sm"
              >
                Simpan Draf
              </button>
              <button
                type="button"
                onClick={() => handleSave('COMPLETED')}
                disabled={saving}
                className="btn btn-primary btn-sm"
              >
                {saving ? 'Menyimpan...' : 'Simpan & Lengkapi Resume'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
