import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import { registrationService } from '../../services/dataService';

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newStatus, setNewStatus] = useState('NEW');
  const [adminNotes, setAdminNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await registrationService.getAll();
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load registrations:', err);
      setError('Gagal memuat data pendaftaran siswa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = (registrations || []).filter((r) => {
    const fullName = String(r?.fullName ?? '').toLowerCase();
    const phone = String(r?.phone ?? '');
    const city = String(r?.city ?? '').toLowerCase();
    const regCode = String(r?.registrationCode ?? '').toLowerCase();
    const searchTerm = String(search ?? '').toLowerCase();

    const matchSearch =
      fullName.includes(searchTerm) ||
      phone.includes(search) ||
      city.includes(searchTerm) ||
      regCode.includes(searchTerm);
    const matchStatus = filterStatus === 'ALL' || r?.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleOpenStatusModal = (item) => {
    setSelectedItem(item);
    setNewStatus(item.status);
    setAdminNotes(item.adminNotes || '');
    setStatusModalOpen(true);
  };

  const handleUpdateStatusAndNotes = async (e) => {
    e.preventDefault();
    if (selectedItem) {
      await registrationService.updateStatus(selectedItem.id, newStatus);
      await registrationService.updateNotes(selectedItem.id, adminNotes);
      setStatusModalOpen(false);
      loadData();
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await registrationService.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  };

  const columns = [
    {
      header: 'ID & Nama Siswa',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{row.fullName}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--vermilion)', fontWeight: 600 }}>{row.registrationCode}</div>
        </div>
      )
    },
    { header: 'No. WhatsApp', accessor: 'phone' },
    { header: 'Program Diminati', accessor: 'programInterest' },
    { header: 'Asal Kota', accessor: 'city' },
    {
      header: 'Status Pipeline',
      render: (row) => <StatusBadge status={row.status} />
    },
    { header: 'Tanggal Masuk', accessor: 'createdAt' }
  ];

  return (
    <div>
      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#EF4444',
          border: '1px solid rgba(239, 68, 68, 0.25)'
        }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.875rem' }}>{error}</span>
        </div>
      )}
      <DataTable
        columns={columns}
        data={filtered}
        totalItems={filtered.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari pendaftar, no WA, kota..."
        filterValue={filterStatus}
        onFilterChange={setFilterStatus}
        filterOptions={[
          { value: 'ALL', label: 'Semua Status Pipeline' },
          { value: 'NEW', label: 'NEW (Baru Masuk)' },
          { value: 'CONTACTED', label: 'CONTACTED (Sudah Dihubungi)' },
          { value: 'CONSULTATION', label: 'CONSULTATION (Sesi Konsultasi)' },
          { value: 'REGISTERED', label: 'REGISTERED (Terdaftar Lunas)' },
          { value: 'TRAINING', label: 'TRAINING (Masa Belajar)' },
          { value: 'COMPLETED', label: 'COMPLETED (Siap Berangkat)' },
          { value: 'REJECTED', label: 'REJECTED (Batal/Ditolak)' }
        ]}
        onView={(row) => setViewItem(row)}
        onEdit={(row) => handleOpenStatusModal(row)}
        onDelete={(row) => setDeleteTarget(row)}
      />

      {/* View Detail Modal */}
      <Modal
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        title="Detail Berkas Pendaftaran Siswa"
        footer={
          <button type="button" onClick={() => setViewItem(null)} className="btn btn-outline btn-sm">
            Tutup
          </button>
        }
      >
        {viewItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>KODE REGISTRASI</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--vermilion)' }}>{viewItem.registrationCode}</div>
              </div>
              <StatusBadge status={viewItem.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>NAMA LENGKAP</span>
                <div style={{ fontWeight: 700 }}>{viewItem.fullName}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>TANGGAL LAHIR</span>
                <div>{viewItem.dob}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>WHATSAPP</span>
                <div>{viewItem.phone}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>EMAIL</span>
                <div>{viewItem.email}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>PENDIDIKAN TERAKHIR</span>
                <div>{viewItem.education}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>KOTA DOMISILI</span>
                <div>{viewItem.city}</div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>PROGRAM & TARGET KARIER</span>
              <div style={{ fontWeight: 600, color: '#0F172A' }}>{viewItem.programInterest}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Target: {viewItem.japanGoal} (Level Awal: {viewItem.japaneseLevel})</div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>CATATAN ADMISI (INTERNAL)</span>
              <p style={{ margin: '0.25rem 0 0 0', color: '#334155', fontStyle: 'italic' }}>
                {viewItem.adminNotes || 'Belum ada catatan internal.'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Status & Notes Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Ubah Status & Catatan Pendaftaran"
        footer={
          <>
            <button type="button" onClick={() => setStatusModalOpen(false)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="status-form" className="btn btn-primary btn-sm">
              Perbarui Status Siswa
            </button>
          </>
        }
      >
        <form id="status-form" onSubmit={handleUpdateStatusAndNotes}>
          <div style={{ marginBottom: '1.25rem', backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{selectedItem?.fullName}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{selectedItem?.registrationCode} • {selectedItem?.programInterest}</div>
          </div>

          <FormField
            label="Pilih Status Pipeline"
            type="select"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: 'NEW', label: 'NEW - Baru Mendaftar' },
              { value: 'CONTACTED', label: 'CONTACTED - Sudah Dihubungi WA' },
              { value: 'CONSULTATION', label: 'CONSULTATION - Sesi Wawancara/Zoom' },
              { value: 'REGISTERED', label: 'REGISTERED - Terdaftar & Berkas Lengkap' },
              { value: 'TRAINING', label: 'TRAINING - Aktif Mengikuti Pelatihan' },
              { value: 'COMPLETED', label: 'COMPLETED - Lolos Wawancara Jepang' },
              { value: 'REJECTED', label: 'REJECTED - Batal / Tidak Memenuhi Syarat' }
            ]}
          />

          <FormField
            label="Catatan Perkembangan Siswa"
            type="textarea"
            rows={4}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Tuliskan catatan hasil komunikasi, perjanjian pembayaran, atau dokumen yang kurang..."
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Pendaftaran"
        message={`Apakah Anda yakin ingin menghapus data pendaftar '${deleteTarget?.fullName}' (${deleteTarget?.registrationCode})?`}
      />
    </div>
  );
}
