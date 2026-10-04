import React, { useState, useEffect, useCallback } from 'react';
import { FileCheck, UploadCloud, X, File as FileIcon, Image as ImageIcon, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';
import { apiClient } from '../../services/apiClient';
import { useRealtimeEvent, useRealtime } from '../../context/RealtimeContext';

export default function StudentPermissionPage() {
  const [classes, setClasses] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    type: 'sakit',
    class_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    otherType: ''
  });

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState(null);

  const { onReconnect } = useRealtime();

  // Load real enrolled classes and existing permission requests
  const loadPermissionData = useCallback(async () => {
    try {
      const [classRes, permRes] = await Promise.allSettled([
        apiClient.get('/student/classes'),
        apiClient.get('/student/permissions')
      ]);

      if (classRes.status === 'fulfilled' && classRes.value.data?.success) {
        const cls = classRes.value.data.data || [];
        setClasses(cls);
        if (cls.length > 0 && !formData.class_id) {
          setFormData((prev) => ({ ...prev, class_id: cls[0].id }));
        }
      }

      if (permRes.status === 'fulfilled' && permRes.value.data?.success) {
        setPermissions(permRes.value.data.data || []);
      }
    } catch (err) {
      console.warn('Failed to load permission data:', err);
    } finally {
      setLoading(false);
    }
  }, [formData.class_id]);

  useEffect(() => {
    loadPermissionData();
  }, [loadPermissionData]);

  // Auto-resync when connection is restored
  useEffect(() => {
    return onReconnect(() => {
      loadPermissionData();
    });
  }, [onReconnect, loadPermissionData]);

  // REALTIME EVENT: Permission Reviewed by Teacher/Admin
  useRealtimeEvent('permission.reviewed', (data) => {
    setPermissions((prev) =>
      prev.map((item) =>
        item.id === data.id
          ? {
              ...item,
              status: data.status,
              review_notes: data.reviewNotes || data.review_notes,
              reviewed_at: data.reviewedAt
            }
          : item
      )
    );

    setSubmitFeedback({
      type: 'info',
      message: `Status pengajuan izin Anda telah diperbarui menjadi ${data.status.toUpperCase()} oleh Pengajar.`
    });
  });

  const handleFileChange = (e) => {
    setFileError('');
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError('Ukuran file melebihi 5 MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setFileError('Format file tidak didukung. Gunakan JPG, PNG, atau PDF.');
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.class_id) {
      setSubmitFeedback({ type: 'error', message: 'Silakan pilih kelas pelatihan aktif.' });
      return;
    }

    setSubmitting(true);
    setSubmitFeedback(null);

    try {
      const payload = {
        class_id: parseInt(formData.class_id, 10),
        type: formData.type === 'Lainnya' ? (formData.otherType || 'lainnya') : formData.type.toLowerCase(),
        start_date: formData.start_date,
        end_date: formData.end_date || formData.start_date,
        reason: formData.reason
      };

      const res = await apiClient.post('/student/permissions', payload);

      if (res.data?.success && res.data.data) {
        const createdPerm = res.data.data;

        // If file attachment was provided, upload it
        if (file) {
          const fileData = new FormData();
          fileData.append('file', file);
          fileData.append('attachment', file);
          fileData.append('description', 'Dokumen bukti izin siswa');

          try {
            await apiClient.post(`/student/permissions/${createdPerm.id}/attachments`, fileData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } catch (uploadErr) {
            console.warn('Attachment upload failed, but permission was created:', uploadErr);
          }
        }

        setPermissions((prev) => [createdPerm, ...prev]);
        setSubmitFeedback({
          type: 'success',
          message: 'Pengajuan izin berhasil dikirimkan ke Sensei/Pengajar kelas Anda.'
        });

        // Reset form
        setFormData({
          type: 'sakit',
          class_id: classes[0]?.id || '',
          start_date: '',
          end_date: '',
          reason: '',
          otherType: ''
        });
        setFile(null);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengajukan permohonan izin.';
      setSubmitFeedback({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-narrow">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Izin & Ketidakhadiran
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Ajukan permohonan dispensasi / surat izin ketidakhadiran langsung ke pengajar kelas Anda.
        </p>
      </div>

      {submitFeedback && (
        <div
          style={{
            backgroundColor: submitFeedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'var(--emerald-subtle)',
            border: `1px solid ${submitFeedback.type === 'error' ? 'var(--vermilion-border)' : 'var(--emerald-border)'}`,
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            color: submitFeedback.type === 'error' ? 'var(--vermilion)' : 'var(--emerald)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {submitFeedback.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>
                {submitFeedback.type === 'error' ? 'Gagal Mengajukan' : 'Pengajuan Berhasil Diproses'}
              </div>
              <div style={{ fontSize: '0.85rem' }}>{submitFeedback.message}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSubmitFeedback(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Form Pengajuan Izin */}
        <div className="card-editorial" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <FileCheck size={20} style={{ color: 'var(--vermilion)' }} />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Form Pengajuan Izin</h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Jenis Izin</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="sakit">Sakit</option>
                <option value="izin">Izin Pribadi</option>
                <option value="keperluan_keluarga">Keperluan Keluarga</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {formData.type === 'Lainnya' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Sebutkan Jenis Izin</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ketik jenis izin..."
                  value={formData.otherType}
                  onChange={(e) => setFormData({ ...formData, otherType: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Kelas Pelatihan</label>
              <select
                className="form-select"
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                required
              >
                {classes.length === 0 ? (
                  <option value="">Tidak ada kelas aktif</option>
                ) : (
                  classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.class_name || c.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid-2" style={{ gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tanggal Mulai</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tanggal Berakhir</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.end_date}
                  min={formData.start_date}
                  placeholder="Opsional jika 1 hari"
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Alasan / Keterangan Lengkap</label>
              <textarea
                className="form-textarea"
                placeholder="Jelaskan alasan izin Anda secara rinci..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Bukti Pendukung {formData.type === 'sakit' && <span style={{ color: 'var(--vermilion)', fontWeight: 'normal', fontSize: '0.8rem', marginLeft: '0.5rem' }}>(Surat dokter / bukti foto)</span>}
              </label>

              {!file ? (
                <div>
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '2rem',
                      border: '2px dashed var(--border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-canvas)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <UploadCloud size={28} style={{ color: 'var(--text-muted)' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Klik untuk memilih file</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Format JPG, PNG, atau PDF. Maksimal 5 MB.</div>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg, image/png, application/pdf"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {fileError && <div style={{ color: 'var(--vermilion)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><AlertCircle size={14} /> {fileError}</div>}
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-canvas)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    {file.type.includes('image') ? <ImageIcon size={24} style={{ color: 'var(--text-secondary)' }} /> : <FileText size={24} style={{ color: 'var(--text-secondary)' }} />}
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.includes('pdf') ? 'PDF' : 'Image'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    style={{ padding: '0.4rem', color: 'var(--text-muted)', borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer' }}
                    title="Hapus File"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting || classes.length === 0} style={{ marginTop: '0.5rem' }}>
              {submitting ? 'Mengirim Pengajuan...' : 'Ajukan Izin'}
            </button>
          </form>
        </div>

        {/* Riwayat Pengajuan Izin */}
        <div className="card-editorial" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <FileText size={20} style={{ color: 'var(--text-primary)' }} />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Riwayat Pengajuan</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {permissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Belum ada permohonan izin yang diajukan.
              </div>
            ) : (
              permissions.map((item) => (
                <div key={item.id} style={{
                  padding: '1rem',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-canvas)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem', textTransform: 'capitalize' }}>
                        {item.type}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Periode: {item.start_date || item.startDate} {item.end_date && item.end_date !== item.start_date ? `s/d ${item.end_date}` : ''}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Alasan: {item.reason}
                      </div>
                    </div>
                    <StatusBadge status={(item.status || 'PENDING').toUpperCase()} />
                  </div>

                  {(item.status === 'REJECTED' || item.status === 'rejected') && (item.review_notes || item.reviewNotes) && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--vermilion)', backgroundColor: 'var(--vermilion-subtle)', padding: '0.5rem', borderRadius: '4px', marginTop: '0.25rem' }}>
                      <strong>Catatan Pengajar:</strong> {item.review_notes || item.reviewNotes}
                    </div>
                  )}

                  {(item.status === 'APPROVED' || item.status === 'approved') && (item.review_notes || item.reviewNotes) && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--emerald)', backgroundColor: 'var(--emerald-subtle)', padding: '0.5rem', borderRadius: '4px', marginTop: '0.25rem' }}>
                      <strong>Catatan Pengajar:</strong> {item.review_notes || item.reviewNotes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
