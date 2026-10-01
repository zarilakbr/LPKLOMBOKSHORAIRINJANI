import React, { useState } from 'react';
import { FileCheck, UploadCloud, X, File as FileIcon, Image as ImageIcon, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import StatusBadge from '../../components/admin/StatusBadge';

const mockHistory = [
  { id: 1, date: '2026-10-01', type: 'Sakit', period: '01 Okt 2026', status: 'PENDING', proof: 'surat-sakit.jpg' },
  { id: 2, date: '2026-09-28', type: 'Izin', period: '28 Sep 2026', status: 'APPROVED', proof: '-' },
  { id: 3, date: '2026-09-15', type: 'Keperluan Keluarga', period: '15 Sep - 16 Sep 2026', status: 'REJECTED', proof: '-', reason: 'Alasan tidak spesifik' }
];

export default function StudentPermissionPage() {
  const [formData, setFormData] = useState({
    type: 'Sakit',
    date: '',
    class: 'Bahasa Jepang N4 - Batch A',
    reason: '',
    otherType: ''
  });
  
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error'
  
  const handleFileChange = (e) => {
    setFileError('');
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
    
    // Check size (Max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFileError('Ukuran file melebihi 5 MB.');
      return;
    }
    
    // Check type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setFileError('Format file tidak didukung. Gunakan JPG, PNG, atau PDF.');
      return;
    }
    
    setFile(selectedFile);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate if Sakit but no file
    if (formData.type === 'Sakit' && !file) {
      setFileError('Bukti sakit berupa surat keterangan dianjurkan/diperlukan.');
      // Wait, user said: "Jika Jenis Izin = Sakit, Bukti sangat dianjurkan... Jangan mengklaim dokumen tertentu wajib secara hukum. UI harus menampilkan...". 
      // Let's just allow it but maybe warn, or we can just proceed. For now, we proceed to mock success.
    }
    
    // Mock simulation
    setTimeout(() => {
      setSubmitStatus('success');
      // Reset form
      setFormData({ type: 'Sakit', date: '', class: 'Bahasa Jepang N4 - Batch A', reason: '', otherType: '' });
      setFile(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    }, 1000);
  };

  return (
    <div className="container-narrow">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Izin & Ketidakhadiran
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Ajukan izin ketidakhadiran langsung melalui aplikasi.
        </p>
      </div>
      
      {/* Development Banner */}
      <div style={{
        backgroundColor: 'var(--ochre-subtle)',
        border: '1px solid var(--ochre-border)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.85rem',
        color: 'var(--ochre)'
      }}>
        <AlertCircle size={16} style={{ flexShrink: 0 }} />
        <span>Data dan pengajuan saat ini berjalan pada mode <strong>Development (Mock)</strong>. Form ini belum tersambung ke backend.</span>
      </div>
      
      {/* Notification Toast (Mock) */}
      {submitStatus === 'success' && (
        <div style={{
          backgroundColor: 'var(--emerald-subtle)',
          border: '1px solid var(--emerald-border)',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--emerald)',
          animation: 'navFadeIn 0.3s ease-out'
        }}>
          <CheckCircle size={20} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Pengajuan Izin Berhasil</div>
            <div style={{ fontSize: '0.85rem' }}>Pengajuan izin Anda sedang ditinjau oleh Admin/Pengajar.</div>
          </div>
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
                <option value="Sakit">Sakit</option>
                <option value="Izin">Izin</option>
                <option value="Keperluan Penting">Keperluan Penting</option>
                <option value="Keperluan Keluarga">Keperluan Keluarga</option>
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
            
            <div className="grid-2" style={{ gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tanggal Mulai</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Jadwal Kelas</label>
                <select 
                  className="form-select" 
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  required
                >
                  <option value="Bahasa Jepang N4 - Batch A">Bahasa Jepang N4 - Batch A</option>
                  <option value="Bahasa Jepang N5 - Batch B">Bahasa Jepang N5 - Batch B</option>
                </select>
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Alasan / Keterangan Tambahan</label>
              <textarea 
                className="form-textarea" 
                placeholder="Jelaskan alasan izin Anda..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              ></textarea>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Bukti Pendukung {formData.type === 'Sakit' && <span style={{ color: 'var(--vermilion)', fontWeight: 'normal', fontSize: '0.8rem', marginLeft: '0.5rem' }}>(Sangat dianjurkan untuk Sakit)</span>}
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
                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--vermilion)'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-strong)'}
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
                    style={{ padding: '0.4rem', color: 'var(--text-muted)', borderRadius: '50%' }}
                    title="Hapus File"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Ajukan Izin
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
            {mockHistory.map(item => (
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
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{item.type}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Periode: {item.period}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Diajukan: {item.date}</div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                
                {item.status === 'REJECTED' && item.reason && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--vermilion)', backgroundColor: 'var(--vermilion-subtle)', padding: '0.5rem', borderRadius: '4px', marginTop: '0.25rem' }}>
                    <strong>Ditolak:</strong> {item.reason}
                  </div>
                )}
                
                {item.proof !== '-' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                    <ImageIcon size={12} /> Bukti Terlampir
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
