import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  Search,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Copy,
  Trash2
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import PhotoUrlField from '../../components/admin/PhotoUrlField';
import { userService } from '../../services/dataService';
import { useSearchParams } from 'react-router-dom';

const defaultUserRow = () => ({
  name: '',
  email: '',
  phone: '',
  avatar: '',
  password: '',
  role: 'ADMIN',
  department: 'Manajemen Lembaga',
  status: 'ACTIVE'
});

export default function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [activeTab, setActiveTab] = useState(
    tabParam === 'verification' ? 'VERIFICATION' : 'ALL'
  );

  useEffect(() => {
    if (tabParam === 'verification') {
      setActiveTab('VERIFICATION');
    } else {
      setActiveTab('ALL');
    }
  }, [tabParam]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Modals
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view' | 'reject' | null
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  // Form State for Create/Edit
  const [createRows, setCreateRows] = useState([defaultUserRow()]);
  const [formData, setFormData] = useState(defaultUserRow());

  const loadData = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await userService.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setFeedback({ type: 'error', message: 'Gagal memuat daftar pengguna.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived collections
  const pendingUsers = users.filter(
    (u) => u.status === 'PENDING' || u.status === 'PENDING_VERIFICATION'
  );

  const filteredAllUsers = users.filter((u) => {
    const name = String(u?.name ?? '').toLowerCase();
    const email = String(u?.email ?? '').toLowerCase();
    const phone = String(u?.phone ?? '').toLowerCase();
    const searchTerm = String(search ?? '').toLowerCase();

    const matchSearch = name.includes(searchTerm) || email.includes(searchTerm) || phone.includes(searchTerm);
    const matchRole = filterRole === 'ALL' || u?.role === filterRole;
    return matchSearch && matchRole;
  });

  const filteredPendingUsers = pendingUsers.filter((u) => {
    const name = String(u?.name ?? '').toLowerCase();
    const email = String(u?.email ?? '').toLowerCase();
    const phone = String(u?.phone ?? '').toLowerCase();
    const searchTerm = String(search ?? '').toLowerCase();
    const matchRole = filterRole === 'ALL' || u?.role === filterRole;

    return (name.includes(searchTerm) || email.includes(searchTerm) || phone.includes(searchTerm)) && matchRole;
  });

  // Action: Approve
  const handleApprove = async (user) => {
    if (!user) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await userService.approve(user.id);
      setFeedback({
        type: 'success',
        message: `Pendaftaran ${user.name} (${user.role}) berhasil disetujui. Akun kini aktif.`
      });
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menyetujui akun pengguna.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Open Reject Modal
  const handleOpenReject = (user) => {
    setSelectedUser(user);
    setRejectionReason('');
    setRejectError('');
    setModalMode('reject');
  };

  // Action: Submit Reject
  const handleSubmitReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectError('Alasan penolakan wajib diisi.');
      return;
    }

    setActionLoading(true);
    setRejectError('');
    try {
      await userService.reject(selectedUser.id, rejectionReason.trim());
      setFeedback({
        type: 'success',
        message: `Pendaftaran ${selectedUser.name} telah ditolak dengan alasan tersimpan.`
      });
      setModalMode(null);
      setSelectedUser(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menolak pendaftaran pengguna.';
      setRejectError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Open Create Modal
  const handleOpenCreate = () => {
    setCreateRows([defaultUserRow()]);
    setSelectedUser(null);
    setModalMode('create');
  };

  const handleAddRow = () => {
    setCreateRows((prev) => [
      ...prev,
      defaultUserRow()
    ]);
  };

  const handleDuplicateRow = (index) => {
    setCreateRows((prev) => {
      const source = prev[index];
      const clone = {
        ...source,
        name: source.name ? `${source.name} (Salinan)` : '',
        email: '' // clear email to prevent collision
      };
      const next = [...prev];
      next.splice(index + 1, 0, clone);
      return next;
    });
  };

  const handleRemoveRow = (index) => {
    setCreateRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, value) => {
    setCreateRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Action: Open Edit Modal
  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
      role: user.role || 'SISWA',
      department: user.department || '',
      status: user.status || 'ACTIVE'
    });
    setModalMode('edit');
  };

  // Action: Save Create / Edit
  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);
    try {
      if (modalMode === 'create') {
        for (let i = 0; i < createRows.length; i++) {
          const row = createRows[i];
          if (!row.name?.trim() || !row.email?.trim() || !row.password?.trim()) {
            setFeedback({
              type: 'error',
              message: `Baris #${i + 1}: Nama lengkap, email, dan kata sandi awal wajib diisi.`
            });
            setActionLoading(false);
            return;
          }
          if (!row.email.includes('@')) {
            setFeedback({
              type: 'error',
              message: `Baris #${i + 1}: Format alamat email tidak valid.`
            });
            setActionLoading(false);
            return;
          }
          if (row.password.length < 6) {
            setFeedback({
              type: 'error',
              message: `Baris #${i + 1}: Kata sandi awal minimal 6 karakter.`
            });
            setActionLoading(false);
            return;
          }
        }
        await Promise.all(createRows.map((row) => userService.create(row)));
        setFeedback({
          type: 'success',
          message: `Berhasil menambahkan ${createRows.length} pengguna baru.`
        });
      } else if (modalMode === 'edit' && selectedUser) {
        if (!formData.name?.trim() || !formData.email?.trim()) {
          setFeedback({ type: 'error', message: 'Nama dan email pengguna wajib diisi.' });
          setActionLoading(false);
          return;
        }
        await userService.update(selectedUser.id, formData);
        setFeedback({ type: 'success', message: 'Data pengguna berhasil diperbarui.' });
      }
      setModalMode(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menyimpan data pengguna.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      await userService.delete(deleteTarget.id);
      setFeedback({ type: 'success', message: `Akun ${deleteTarget.name} berhasil dihapus.` });
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menghapus akun pengguna.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            Manajemen Pengguna & Verifikasi Akun
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Kelola hak akses pengguna (RBAC: Admin, Pengajar, Siswa) dan review pendaftaran baru.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--vermilion)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            color: feedback.type === 'error' ? 'var(--vermilion)' : 'var(--emerald)',
            border: `1px solid ${feedback.type === 'error' ? 'var(--vermilion-border)' : 'rgba(16, 185, 129, 0.25)'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs: Menunggu Verifikasi vs Semua Pengguna */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => {
            setActiveTab('VERIFICATION');
            setSearchParams({ tab: 'verification' });
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.15rem',
            borderBottom: activeTab === 'VERIFICATION' ? '2px solid var(--vermilion)' : '2px solid transparent',
            color: activeTab === 'VERIFICATION' ? 'var(--vermilion)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'VERIFICATION' ? 700 : 500,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          <Clock size={16} />
          <span>Menunggu Verifikasi</span>
          <span
            style={{
              padding: '0.15rem 0.55rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: pendingUsers.length > 0 ? 'var(--vermilion)' : 'var(--bg-surface-subtle)',
              color: pendingUsers.length > 0 ? '#FFFFFF' : 'var(--text-muted)'
            }}
          >
            {pendingUsers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('ALL');
            setSearchParams({});
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.15rem',
            borderBottom: activeTab === 'ALL' ? '2px solid var(--vermilion)' : '2px solid transparent',
            color: activeTab === 'ALL' ? 'var(--vermilion)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'ALL' ? 700 : 500,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          <Users size={16} />
          <span>Semua Pengguna Terdaftar</span>
          <span
            style={{
              padding: '0.15rem 0.55rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--text-muted)'
            }}
          >
            {users.length}
          </span>
        </button>
      </div>

      {/* TAB A: MENUNGGU VERIFIKASI (Approval Workflow) */}
      {activeTab === 'VERIFICATION' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              fontSize: '0.85rem',
              color: '#1E40AF',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}
          >
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <span>
              <strong>Persetujuan Administrator Wajib:</strong> Calon Siswa dan Pengajar baru harus disetujui terlebih dahulu sebelum dapat login dan mengakses modul LMS.
            </span>
          </div>

          {filteredPendingUsers.length === 0 ? (
            <div
              style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)'
              }}
            >
              <CheckCircle2 size={40} style={{ color: 'var(--emerald)', margin: '0 auto 0.75rem auto' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Tidak Ada Pendaftar Menunggu Verifikasi
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                Semua pendaftar akun telah ditinjau dan disetujui atau ditolak oleh Administrator.
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden'
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-surface-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Nama & Kontak</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Peran Diajukan</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tgl Daftar</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Verifikasi Email</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Status Akun</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPendingUsers.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0D8ABC&color=fff`}
                              alt={user.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=0D8ABC&color=fff`;
                              }}
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                                <Mail size={12} />
                                <span>{user.email}</span>
                              </div>
                              {user.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                                  <Phone size={12} />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <StatusBadge status={user.role} />
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {user.department || (user.role === 'PENGAJAR' ? 'Calon Sensei' : 'Calon Siswa')}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {user.emailVerifiedAt ? (
                            <span style={{ color: 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', fontWeight: 600 }}>
                              <CheckCircle2 size={13} /> Terverifikasi
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem' }}>
                              <Clock size={13} /> Belum
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: 'rgba(234, 179, 8, 0.15)',
                              color: '#B45309',
                              border: '1px solid rgba(234, 179, 8, 0.3)'
                            }}
                          >
                            Menunggu Verifikasi
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUser(user);
                                setModalMode('view');
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.35rem 0.65rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-subtle)',
                                backgroundColor: 'var(--bg-surface)',
                                color: 'var(--text-primary)',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              title="Lihat Detail Pendaftar"
                            >
                              <Eye size={13} />
                              <span>Detail</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleApprove(user)}
                              disabled={actionLoading}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.35rem 0.65rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                backgroundColor: 'var(--emerald)',
                                color: '#FFFFFF',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                              title="Setujui dan Aktifkan Akun"
                            >
                              <CheckCircle2 size={13} />
                              <span>Setujui</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenReject(user)}
                              disabled={actionLoading}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.35rem 0.65rem',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                backgroundColor: 'var(--vermilion)',
                                color: '#FFFFFF',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                              title="Tolak Pendaftaran"
                            >
                              <XCircle size={13} />
                              <span>Tolak</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB B: SEMUA PENGGUNA TERDAFTAR */}
      {activeTab === 'ALL' && (
        <DataTable
          columns={[
            {
              header: 'Nama & Email Pengguna',
              render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={row.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name || 'User')}&background=0D8ABC&color=fff`}
                    alt={row.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name || 'User')}&background=0D8ABC&color=fff`;
                    }}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.email}</div>
                    {row.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.phone}</div>}
                  </div>
                </div>
              )
            },
            {
              header: 'Peran Akses (Role)',
              render: (row) => <StatusBadge status={row.role} />
            },
            { header: 'Divisi / Keterangan', accessor: 'department' },
            {
              header: 'Status Akun',
              render: (row) => <StatusBadge status={row.status} />
            },
            {
              header: 'Tgl Terdaftar',
              render: (row) => (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {row.createdAt ? new Date(row.createdAt).toLocaleDateString('id-ID') : '-'}
                </span>
              )
            }
          ]}
          data={filteredAllUsers}
          totalItems={filteredAllUsers.length}
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari pengguna berdasarkan nama/email/telepon..."
          filterValue={filterRole}
          onFilterChange={setFilterRole}
          filterOptions={[
            { value: 'ALL', label: 'Semua Role' },
            { value: 'ADMIN', label: 'ADMIN' },
            { value: 'PENGAJAR', label: 'PENGAJAR' },
            { value: 'SISWA', label: 'SISWA' }
          ]}
          onView={(row) => {
            setSelectedUser(row);
            setModalMode('view');
          }}
          onEdit={handleOpenEdit}
          onDelete={(row) => setDeleteTarget(row)}
        />
      )}

      {/* MODAL 1: VIEW DETAIL */}
      <Modal
        isOpen={modalMode === 'view' && !!selectedUser}
        onClose={() => setModalMode(null)}
        title="Detail Profil Pengguna"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div>
              {(selectedUser?.status === 'PENDING' || selectedUser?.status === 'PENDING_VERIFICATION') && (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode(null);
                      handleApprove(selectedUser);
                    }}
                    className="btn btn-sm"
                    style={{ backgroundColor: 'var(--emerald)', color: '#FFF' }}
                  >
                    Setujui Akun
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenReject(selectedUser)}
                    className="btn btn-sm"
                    style={{ backgroundColor: 'var(--vermilion)', color: '#FFF' }}
                  >
                    Tolak Akun
                  </button>
                </div>
              )}
            </div>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Tutup
            </button>
          </div>
        }
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <img
                src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name || 'User')}&background=0D8ABC&color=fff`}
                alt={selectedUser.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name || 'User')}&background=0D8ABC&color=fff`;
                }}
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedUser.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedUser.email}</div>
                <div style={{ marginTop: '0.25rem' }}><StatusBadge status={selectedUser.role} /></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nama Lengkap</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedUser.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Alamat Email</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedUser.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No. Telepon/WhatsApp</div>
                <div>{selectedUser.phone || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Peran (Role)</div>
                <div><StatusBadge status={selectedUser.role} /></div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status Akun</div>
                <div><StatusBadge status={selectedUser.status} /></div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Divisi / Keterangan</div>
                <div>{selectedUser.department || '-'}</div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '0.5rem 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tanggal Pendaftaran</div>
                <div>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString('id-ID') : '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verifikasi Email</div>
                <div>{selectedUser.emailVerifiedAt ? new Date(selectedUser.emailVerifiedAt).toLocaleString('id-ID') : 'Belum diverifikasi'}</div>
              </div>
              {selectedUser.approvedAt && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Disetujui Pada</div>
                  <div style={{ color: 'var(--emerald)', fontWeight: 600 }}>{new Date(selectedUser.approvedAt).toLocaleString('id-ID')}</div>
                </div>
              )}
              {selectedUser.rejectedAt && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ditolak Pada</div>
                  <div style={{ color: 'var(--vermilion)', fontWeight: 600 }}>{new Date(selectedUser.rejectedAt).toLocaleString('id-ID')}</div>
                </div>
              )}
            </div>

            {selectedUser.rejectionReason && (
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--vermilion)', fontWeight: 700, marginBottom: '0.2rem' }}>
                  Alasan Penolakan:
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{selectedUser.rejectionReason}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* MODAL 2: REJECT WITH REASON */}
      <Modal
        isOpen={modalMode === 'reject' && !!selectedUser}
        onClose={() => setModalMode(null)}
        title="Tolak Pendaftaran Pengguna"
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button
              type="submit"
              form="reject-form"
              disabled={actionLoading}
              className="btn btn-sm"
              style={{ backgroundColor: 'var(--vermilion)', color: '#FFF' }}
            >
              {actionLoading ? 'Menyimpan...' : 'Tolak Pendaftaran'}
            </button>
          </>
        }
      >
        <form id="reject-form" onSubmit={handleSubmitReject}>
          {rejectError && (
            <div style={{ padding: '0.5rem 0.75rem', marginBottom: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--vermilion)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              {rejectError}
            </div>
          )}
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Anda akan menolak pendaftaran akun <strong>{selectedUser?.name}</strong> ({selectedUser?.email}). Data pendaftar tetap tersimpan dalam sistem dengan status REJECTED.
          </p>

          <FormField
            label="Alasan Penolakan Pendaftaran *"
            type="textarea"
            required
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Jelaskan alasan penolakan, misal: berkas identitas belum lengkap, tidak memenuhi kualifikasi kelas, dll."
          />
        </form>
      </Modal>

      {/* MODAL 3: CREATE / EDIT USER */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? `Tambah Pengguna Baru (${createRows.length} Data)` : 'Edit Pengguna'}
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="user-form" disabled={actionLoading} className="btn btn-primary btn-sm">
              {actionLoading
                ? 'Menyimpan...'
                : (modalMode === 'create' ? `Simpan Semua Pengguna (${createRows.length} Data)` : 'Simpan Pengguna')}
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSave}>
          {modalMode === 'create' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {createRows.map((row, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '1rem',
                    backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid #E2E8F0'
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>
                      Pengguna #{index + 1}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleDuplicateRow(index)}
                        className="btn btn-outline btn-xs"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem'
                        }}
                        title="Duplikat baris data ini"
                      >
                        <Copy size={13} /> Duplikat
                      </button>
                      {createRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="btn btn-outline btn-xs"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            color: '#EF4444',
                            borderColor: '#FECACA'
                          }}
                          title="Hapus baris data ini"
                        >
                          <Trash2 size={13} /> Hapus
                        </button>
                      )}
                    </div>
                  </div>

                  <FormField
                    label="Nama Lengkap *"
                    required
                    value={row.name}
                    onChange={(e) => handleRowChange(index, 'name', e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <FormField
                      label="Alamat Email Login *"
                      type="email"
                      required
                      value={row.email}
                      onChange={(e) => handleRowChange(index, 'email', e.target.value)}
                      placeholder="email@example.com"
                    />
                    <FormField
                      label="No. Telepon / WhatsApp"
                      value={row.phone}
                      onChange={(e) => handleRowChange(index, 'phone', e.target.value)}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  <FormField
                    label="Kata Sandi Awal *"
                    type="password"
                    required
                    value={row.password}
                    onChange={(e) => handleRowChange(index, 'password', e.target.value)}
                    placeholder="Minimal 6 karakter"
                  />

                  <PhotoUrlField
                    label="URL Foto Profil / Avatar"
                    value={row.avatar}
                    onChange={(val) => handleRowChange(index, 'avatar', val)}
                    placeholder="https://..."
                    aspectRatio="1/1"
                    previewHeight="100px"
                    fallbackPlaceholder={`https://ui-avatars.com/api/?name=${encodeURIComponent(row.name || 'User')}&background=0D8ABC&color=fff`}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <FormField
                      label="Peran Akses (Role)"
                      type="select"
                      value={row.role}
                      onChange={(e) => handleRowChange(index, 'role', e.target.value)}
                      options={[
                        { value: 'ADMIN', label: 'ADMIN (Administrator Lembaga)' },
                        { value: 'PENGAJAR', label: 'PENGAJAR (Sensei / Instruktur)' },
                        { value: 'SISWA', label: 'SISWA (Peserta Pelatihan)' }
                      ]}
                    />

                    <FormField
                      label="Status Akun"
                      type="select"
                      value={row.status}
                      onChange={(e) => handleRowChange(index, 'status', e.target.value)}
                      options={[
                        { value: 'ACTIVE', label: 'ACTIVE (Aktif / Disetujui)' },
                        { value: 'PENDING', label: 'PENDING (Menunggu Approval)' },
                        { value: 'REJECTED', label: 'REJECTED (Ditolak)' },
                        { value: 'SUSPENDED', label: 'SUSPENDED (Ditangguhkan)' }
                      ]}
                    />
                  </div>

                  <FormField
                    label="Divisi / Departemen"
                    value={row.department}
                    onChange={(e) => handleRowChange(index, 'department', e.target.value)}
                    placeholder="Contoh: Sensei Bahasa Jepang N4"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddRow}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px dashed #CBD5E1',
                  backgroundColor: '#F8FAFC',
                  color: '#2563EB',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Tambah Baris Pengguna Lainnya
              </button>
            </div>
          ) : (
            <div>
              <FormField
                label="Nama Lengkap *"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Budi Santoso"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormField
                  label="Alamat Email Login *"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
                <FormField
                  label="No. Telepon / WhatsApp"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <PhotoUrlField
                label="URL Foto Profil / Avatar"
                value={formData.avatar}
                onChange={(val) => setFormData({ ...formData, avatar: val })}
                placeholder="https://..."
                aspectRatio="1/1"
                previewHeight="100px"
                fallbackPlaceholder={`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || 'User')}&background=0D8ABC&color=fff`}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormField
                  label="Peran Akses (Role)"
                  type="select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  options={[
                    { value: 'ADMIN', label: 'ADMIN (Administrator Lembaga)' },
                    { value: 'PENGAJAR', label: 'PENGAJAR (Sensei / Instruktur)' },
                    { value: 'SISWA', label: 'SISWA (Peserta Pelatihan)' }
                  ]}
                />

                <FormField
                  label="Status Akun"
                  type="select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={[
                    { value: 'ACTIVE', label: 'ACTIVE (Aktif / Disetujui)' },
                    { value: 'PENDING', label: 'PENDING (Menunggu Approval)' },
                    { value: 'REJECTED', label: 'REJECTED (Ditolak)' },
                    { value: 'SUSPENDED', label: 'SUSPENDED (Ditangguhkan)' }
                  ]}
                />
              </div>

              <FormField
                label="Divisi / Departemen"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Contoh: Sensei Bahasa Jepang N4"
              />
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Akun Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun '${deleteTarget?.name}' (${deleteTarget?.role})? Jika akun ini adalah Admin terakhir, penghapusan akan ditolak demi keamanan.`}
        confirmLabel="Hapus Pengguna"
        cancelLabel="Batal"
        isDanger
      />
    </div>
  );
}
