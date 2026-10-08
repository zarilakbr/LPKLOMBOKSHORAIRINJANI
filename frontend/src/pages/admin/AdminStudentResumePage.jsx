import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Printer,
  Edit,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ArrowLeft
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import FormField from '../../components/admin/FormField';
import JapaneseResumePrintView from '../../components/resume/JapaneseResumePrintView';
import { resumeService } from '../../services/dataService';
import { generateJapaneseResumeData } from '../../utils/japaneseResumeHelper';

export default function AdminStudentResumePage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [feedback, setFeedback] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals & Active Views
  const [viewingResume, setViewingResume] = useState(null); // When viewing printable A4 sheet
  const [editingResume, setEditingResume] = useState(null); // When editing Japanese translation
  const [editFormJp, setEditFormJp] = useState({});

  const loadData = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await resumeService.getAll();
      setResumes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load resumes:', err);
      setFeedback({ type: 'error', message: 'Gagal memuat daftar resume siswa.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = (resumes || []).filter((r) => {
    const name = String(r?.student_name ?? '').toLowerCase();
    const email = String(r?.student_email ?? '').toLowerCase();
    const reg = String(r?.register_no ?? '').toLowerCase();
    const searchTerm = String(search ?? '').toLowerCase();

    const matchSearch = name.includes(searchTerm) || email.includes(searchTerm) || reg.includes(searchTerm);
    const matchStatus = filterStatus === 'ALL' || r?.status === filterStatus;

    return matchSearch && matchStatus;
  });

  // Action: Open Printable View
  const handleOpenView = async (row) => {
    setActionLoading(true);
    try {
      const detail = await resumeService.getById(row.id || row.user_id);
      if (detail) {
        // If data_jp is not present, auto-generate fallback
        const effectiveDataJp =
          detail.data_jp ||
          generateJapaneseResumeData(
            { ...(detail.data_id || {}), register_no: detail.register_no },
            detail.profile_photo || row.student_avatar
          );

        setViewingResume({
          ...detail,
          data_jp: effectiveDataJp,
          student_name: row.student_name,
          student_avatar: row.student_avatar,
          user: detail.user || {
            name: row.student_name,
            email: row.student_email,
            phone: row.student_phone,
            avatar: row.student_avatar
          }
        });
      }
    } catch (err) {
      console.error('Failed to load resume detail:', err);
      setFeedback({ type: 'error', message: 'Gagal memuat detail resume siswa.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Open Edit Translation Modal
  const handleOpenEditTranslation = async (row) => {
    setActionLoading(true);
    try {
      const detail = await resumeService.getById(row.id || row.user_id);
      if (detail) {
        const effectiveDataJp =
          detail.data_jp ||
          generateJapaneseResumeData(
            { ...(detail.data_id || {}), register_no: detail.register_no },
            detail.profile_photo || row.student_avatar
          );

        setEditingResume(detail);
        setEditFormJp({
          name_kana: effectiveDataJp.name_kana || '',
          pob_jp: effectiveDataJp.pob_jp || '',
          address_kana: effectiveDataJp.address_kana || '',
          hobbies_jp: effectiveDataJp.hobbies_jp || '',
          skills_jp: effectiveDataJp.skills_jp || '',
          strengths_jp: effectiveDataJp.strengths_jp || '',
          weaknesses_jp: effectiveDataJp.weaknesses_jp || '',
          savings_target_jp: effectiveDataJp.savings_target_jp || '',
          reason_for_japan_jp: effectiveDataJp.reason_for_japan_jp || ''
        });
      }
    } catch (err) {
      console.error('Failed to prepare translation edit:', err);
      setFeedback({ type: 'error', message: 'Gagal membuka form edit terjemahan resume.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Save Updated Japanese Translation
  const handleSaveTranslation = async (e) => {
    e.preventDefault();
    if (!editingResume) return;

    setActionLoading(true);
    try {
      const updatedDataJp = {
        ...(editingResume.data_jp || {}),
        ...editFormJp
      };

      await resumeService.update(editingResume.id || editingResume.user_id, {
        data_jp: updatedDataJp,
        status: 'REVIEWED'
      });

      setFeedback({
        type: 'success',
        message: 'Hasil terjemahan bahasa Jepang resume berhasil diperbarui oleh Administrator.'
      });

      setEditingResume(null);
      await loadData();
    } catch (err) {
      console.error('Failed to save translation:', err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal menyimpan perubahan terjemahan.';
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setActionLoading(false);
    }
  };

  // If in printable view mode, render full print view
  if (viewingResume) {
    return (
      <JapaneseResumePrintView
        dataId={viewingResume.data_id || {}}
        dataJp={viewingResume.data_jp || {}}
        user={viewingResume.user || {}}
        profilePhoto={
          viewingResume.profile_photo ||
          viewingResume.student_avatar ||
          viewingResume.user?.avatar ||
          viewingResume.data_jp?.profile_photo ||
          viewingResume.data_id?.profile_photo ||
          ''
        }
        onBack={() => setViewingResume(null)}
        onEdit={() => {
          const target = viewingResume;
          setViewingResume(null);
          handleOpenEditTranslation(target);
        }}
      />
    );
  }

  const columns = [
    {
      header: 'Siswa & Kontak',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={row.profile_photo || row.student_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.student_name || 'Siswa')}&background=0D8ABC&color=fff`}
            alt={row.student_name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.student_name || 'Siswa')}&background=0D8ABC&color=fff`;
            }}
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.student_name}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{row.student_email}</div>
            {row.student_phone && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.student_phone}</div>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'No. Register',
      accessor: 'register_no'
    },
    {
      header: 'Status Kelengkapan',
      render: (row) => {
        let badgeStatus = row.status;
        if (row.status === 'COMPLETED') badgeStatus = 'ACTIVE';
        if (row.status === 'REVIEWED') badgeStatus = 'ACTIVE';
        if (row.status === 'BELUM_ISI') badgeStatus = 'PENDING';
        return (
          <div>
            <StatusBadge status={badgeStatus} />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {row.status === 'COMPLETED' ? 'Lengkap & Siap Cetak' : row.status === 'REVIEWED' ? 'Ditinjau Admin' : row.status === 'DRAFT' ? 'Draf Siswa' : 'Belum Mengisi'}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Terjemahan Jepang',
      render: (row) => (
        row.has_japanese_data ? (
          <span style={{ color: '#16A34A', fontSize: '0.78rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 size={13} /> Tersedia
          </span>
        ) : (
          <span style={{ color: '#94A3B8', fontSize: '0.78rem' }}>
            {row.status === 'BELUM_ISI' ? '-' : 'Auto-generator'}
          </span>
        )
      )
    },
    {
      header: 'Terakhir Update',
      render: (row) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          {row.updated_at ? new Date(row.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
        </span>
      )
    },
    {
      header: 'Aksi Resume',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => handleOpenView(row)}
            disabled={actionLoading}
            className="btn btn-outline btn-xs"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            title="Lihat Pratinjau & Cetak PDF A4"
          >
            <Printer size={13} /> Cetak PDF
          </button>
          {row.status !== 'BELUM_ISI' && (
            <button
              type="button"
              onClick={() => handleOpenEditTranslation(row)}
              disabled={actionLoading}
              className="btn btn-outline btn-xs"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              title="Edit Hasil Terjemahan Bahasa Jepang"
            >
              <Edit size={13} /> Edit Terjemahan
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            Manajemen Resume Siswa (履歴書 - Rirekisho)
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Daftar resume siswa, status kelengkapan, verifikasi hasil terjemahan Jepang, dan unduh dokumen siap cetak A4.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="btn btn-outline btn-sm"
        >
          Muat Ulang
        </button>
      </div>

      {/* Feedback Banner */}
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

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filtered}
        totalItems={filtered.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari siswa berdasarkan nama/email/No. Register..."
        filterValue={filterStatus}
        onFilterChange={setFilterStatus}
        filterOptions={[
          { value: 'ALL', label: 'Semua Status' },
          { value: 'COMPLETED', label: 'Lengkap (COMPLETED)' },
          { value: 'REVIEWED', label: 'Ditinjau Admin (REVIEWED)' },
          { value: 'DRAFT', label: 'Draf (DRAFT)' },
          { value: 'BELUM_ISI', label: 'Belum Mengisi' }
        ]}
      />

      {/* MODAL: EDIT JAPANESE TRANSLATION */}
      <Modal
        isOpen={!!editingResume}
        onClose={() => setEditingResume(null)}
        title={`Edit Hasil Terjemahan Jepang: ${editingResume?.user?.name || editingResume?.data_id?.name || 'Siswa'}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingResume(null)}
              className="btn btn-outline btn-sm"
              disabled={actionLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              form="edit-translation-form"
              className="btn btn-primary btn-sm"
              disabled={actionLoading}
            >
              {actionLoading ? 'Menyimpan...' : 'Simpan Perubahan Terjemahan'}
            </button>
          </>
        }
      >
        <form id="edit-translation-form" onSubmit={handleSaveTranslation}>
          <div style={{ padding: '0.75rem', backgroundColor: '#F0F9FF', borderRadius: '6px', border: '1px solid #BAE6FD', marginBottom: '1rem', fontSize: '0.8rem', color: '#0369A1' }}>
            Admin dapat mengoreksi teks Katakana dan bentuk bahasa Jepang formal (です・ます) sebelum dicetak ke dokumen resmi.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Nama Lengkap Katakana (氏名フリガナ)"
              value={editFormJp.name_kana}
              onChange={(e) => setEditFormJp({ ...editFormJp, name_kana: e.target.value })}
              placeholder="Contoh: ブディ・サントソ"
            />

            <FormField
              label="Tempat Lahir Katakana (出生地)"
              value={editFormJp.pob_jp}
              onChange={(e) => setEditFormJp({ ...editFormJp, pob_jp: e.target.value })}
              placeholder="Contoh: マタラム、西ロンボク"
            />
          </div>

          <FormField
            label="Alamat Lengkap Katakana (現住所)"
            value={editFormJp.address_kana}
            onChange={(e) => setEditFormJp({ ...editFormJp, address_kana: e.target.value })}
            placeholder="Katakana alamat..."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Hobi Bahasa Jepang (趣味)"
              value={editFormJp.hobbies_jp}
              onChange={(e) => setEditFormJp({ ...editFormJp, hobbies_jp: e.target.value })}
              placeholder="Contoh: バドミントン、読書"
            />

            <FormField
              label="Keahlian Khusus Jepang (特技)"
              value={editFormJp.skills_jp}
              onChange={(e) => setEditFormJp({ ...editFormJp, skills_jp: e.target.value })}
              placeholder="Contoh: 実用日本語コミュニケーション"
            />
          </div>

          <FormField
            label="Kelebihan Diri Bahasa Jepang (長所)"
            type="textarea"
            rows={2}
            value={editFormJp.strengths_jp}
            onChange={(e) => setEditFormJp({ ...editFormJp, strengths_jp: e.target.value })}
          />

          <FormField
            label="Kekurangan Diri Bahasa Jepang (短所)"
            type="textarea"
            rows={2}
            value={editFormJp.weaknesses_jp}
            onChange={(e) => setEditFormJp({ ...editFormJp, weaknesses_jp: e.target.value })}
          />

          <FormField
            label="Target Tabungan (目標貯金額)"
            value={editFormJp.savings_target_jp}
            onChange={(e) => setEditFormJp({ ...editFormJp, savings_target_jp: e.target.value })}
            placeholder="Contoh: 300万円（約3億ルピア）"
          />

          <FormField
            label="Alasan Ingin Bekerja di Jepang (志望理由)"
            type="textarea"
            rows={3}
            value={editFormJp.reason_for_japan_jp}
            onChange={(e) => setEditFormJp({ ...editFormJp, reason_for_japan_jp: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
}
