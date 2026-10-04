import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Clock,
  Send,
  Users,
  User,
  GraduationCap,
  Presentation
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import { adminNotificationService, userService } from '../../services/dataService';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterRead, setFilterRead] = useState('ALL');

  // Modals
  const [modalMode, setModalMode] = useState(null); // 'create' | 'view' | null
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    target_type: 'all',
    role: 'SISWA',
    user_id: '',
    type: 'pengumuman',
    title: '',
    message: '',
    link: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const [notifRes, usrRes] = await Promise.allSettled([
        adminNotificationService.getAll({ is_read: filterRead }),
        userService.getAll()
      ]);

      if (notifRes.status === 'fulfilled') {
        setNotifications(Array.isArray(notifRes.value) ? notifRes.value : []);
      }
      if (usrRes.status === 'fulfilled') {
        setUsers(Array.isArray(usrRes.value) ? usrRes.value : []);
      }
    } catch (err) {
      console.error('Failed to load admin notifications:', err);
      setFeedback({ type: 'error', message: 'Gagal memuat daftar notifikasi.' });
    } finally {
      setLoading(false);
    }
  }, [filterRead]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = (notifications || []).filter((n) => {
    const title = String(n?.title || '').toLowerCase();
    const message = String(n?.message || '').toLowerCase();
    const searchTerm = String(search || '').toLowerCase();

    return title.includes(searchTerm) || message.includes(searchTerm);
  });

  // Action: Open Broadcast Modal
  const handleOpenCreate = () => {
    setFormData({
      target_type: 'all',
      role: 'SISWA',
      user_id: users.length > 0 ? String(users[0].id) : '',
      type: 'pengumuman',
      title: '',
      message: '',
      link: ''
    });
    setModalMode('create');
  };

  // Action: Submit Broadcast
  const handleSubmitBroadcast = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);
    try {
      const payload = {
        target_type: formData.target_type,
        type: formData.type,
        title: formData.title,
        message: formData.message,
        link: formData.link || null
      };

      if (formData.target_type === 'role') {
        payload.role = formData.role;
      } else if (formData.target_type === 'user') {
        payload.user_id = Number(formData.user_id);
      }

      const res = await adminNotificationService.create(payload);
      setFeedback({
        type: 'success',
        message: `Notifikasi berhasil disiarkan kepada ${res?.deliveredCount ?? ''} penerima.`
      });
      setModalMode(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal mengirim notifikasi.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Mark Read
  const handleMarkAsRead = async (notif) => {
    try {
      await adminNotificationService.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Mark All Read
  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await adminNotificationService.markAllAsRead();
      setFeedback({ type: 'success', message: 'Seluruh notifikasi ditandai telah dibaca.' });
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminNotificationService.delete(deleteTarget.id);
      setFeedback({ type: 'success', message: 'Notifikasi berhasil dihapus.' });
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Gagal menghapus notifikasi.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
            Manajemen Notifikasi Sistem (Broadcast & Alerts)
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Siarkan pengumuman massal, notifikasi akademik, dan kelola peringatan sistem ke seluruh pengguna.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={actionLoading}
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
            <CheckCircle2 size={14} style={{ color: 'var(--emerald)' }} />
            <span>Tandai Semua Dibaca</span>
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
            <Send size={15} />
            <span>Siarkan Notifikasi Baru</span>
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

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau pesan notifikasi..."
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.2rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              boxSizing: 'border-box'
            }}
          />
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        <select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="ALL">Semua Status Baca</option>
          <option value="false">Belum Dibaca (Unread)</option>
          <option value="true">Sudah Dibaca (Read)</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={[
          {
            header: 'Penerima / User ID',
            render: (row) => (
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>User #{row.userId}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  Kategori: {row.type || 'Sistem'}
                </div>
              </div>
            )
          },
          {
            header: 'Judul & Pesan',
            render: (row) => (
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.message}
                </div>
              </div>
            )
          },
          {
            header: 'Waktu Kirim',
            render: (row) => (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {row.createdAt ? new Date(row.createdAt).toLocaleString('id-ID') : '-'}
              </span>
            )
          },
          {
            header: 'Status Baca',
            render: (row) => (
              <span
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: row.isRead ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: row.isRead ? 'var(--emerald)' : 'var(--vermilion)'
                }}
              >
                {row.isRead ? 'Sudah Dibaca' : 'Belum Dibaca'}
              </span>
            )
          },
          {
            header: 'Aksi',
            render: (row) => (
              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                {!row.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(row)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem' }}
                    title="Tandai Sudah Dibaca"
                  >
                    <CheckCircle2 size={13} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDeleteTarget(row)}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem', color: 'var(--vermilion)', borderColor: 'var(--vermilion-border)' }}
                  title="Hapus Notifikasi"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )
          }
        ]}
        data={filtered}
        totalItems={filtered.length}
        loading={loading}
        onAddNew={handleOpenCreate}
        addNewLabel="Siarkan Notifikasi Baru"
        onDelete={(row) => setDeleteTarget(row)}
      />

      {/* MODAL: BROADCAST NOTIFICATION */}
      <Modal
        isOpen={modalMode === 'create'}
        onClose={() => setModalMode(null)}
        title="Siarkan Notifikasi Baru"
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="notif-form" disabled={actionLoading} className="btn btn-primary btn-sm">
              {actionLoading ? 'Menyiarkan...' : 'Kirim & Siarkan Notifikasi'}
            </button>
          </>
        }
      >
        <form id="notif-form" onSubmit={handleSubmitBroadcast}>
          <FormField
            label="Target Penerima Notifikasi *"
            type="select"
            required
            value={formData.target_type}
            onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
            options={[
              { value: 'all', label: 'Semua Pengguna Aktif (Mass Broadcast)' },
              { value: 'role', label: 'Kelompok Peran (Siswa Saja / Pengajar Saja)' },
              { value: 'user', label: 'Satu Pengguna Spesifik' }
            ]}
          />

          {formData.target_type === 'role' && (
            <FormField
              label="Pilih Kelompok Peran *"
              type="select"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'SISWA', label: 'Seluruh Siswa (SISWA)' },
                { value: 'PENGAJAR', label: 'Seluruh Pengajar (PENGAJAR)' }
              ]}
            />
          )}

          {formData.target_type === 'user' && (
            <FormField
              label="Pilih Akun Pengguna *"
              type="select"
              required
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              options={users.map((u) => ({
                value: u.id,
                label: `${u.name} (${u.email}) [${u.role}]`
              }))}
            />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Kategori Notifikasi"
              type="select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'pengumuman', label: 'Pengumuman Resmi Lembaga' },
                { value: 'akademik', label: 'Akademik & Kurikulum' },
                { value: 'jadwal', label: 'Jadwal & Sesi Pelatihan' },
                { value: 'peringatan', label: 'Peringatan & Keamanan' }
              ]}
            />

            <FormField
              label="Tautan Terkait (Opsional)"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="/dashboard/schedule atau https://..."
            />
          </div>

          <FormField
            label="Judul Notifikasi *"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Contoh: Pengumuman Sesi Tambahan Persiapan Wawancara Kerja"
          />

          <FormField
            label="Isi Pesan Notifikasi *"
            type="textarea"
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Tuliskan isi pesan notifikasi yang akan diterima pengguna..."
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Notifikasi"
        message={`Apakah Anda yakin ingin menghapus notifikasi '${deleteTarget?.title}'? Tindakan ini permanen.`}
        confirmLabel="Hapus Notifikasi"
        cancelLabel="Batal"
        isDanger
      />
    </div>
  );
}
