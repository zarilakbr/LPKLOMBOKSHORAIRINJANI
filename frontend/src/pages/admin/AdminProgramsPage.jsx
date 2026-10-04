import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import { programService } from '../../services/dataService';

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState([]);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view' | null
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Dasar & Pondasi',
    level: 'N5 Beginner',
    duration: '3 Bulan (120 Jam)',
    schedule: 'Senin - Kamis, 08.30 - 12.00 WIB',
    shortDescription: '',
    fullDescription: '',
    priceEstimate: 'Rp 3.500.000',
    status: 'ACTIVE'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await programService.getAll();
      setPrograms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load programs:', err);
      setError('Gagal memuat data program pelatihan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = (programs || []).filter((p) => {
    const title = String(p?.title ?? '').toLowerCase();
    const category = String(p?.category ?? '').toLowerCase();
    const level = String(p?.level ?? '');
    const searchTerm = String(search ?? '').toLowerCase();

    const matchSearch = title.includes(searchTerm) || category.includes(searchTerm);
    const matchLevel = filterLevel === 'ALL' || level.includes(filterLevel);
    return matchSearch && matchLevel;
  });

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      category: 'Dasar & Pondasi',
      level: 'N5 Beginner',
      duration: '3 Bulan (120 Jam)',
      schedule: 'Senin - Kamis, 08.30 - 12.00 WIB',
      shortDescription: '',
      fullDescription: '',
      priceEstimate: 'Rp 3.500.000',
      status: 'ACTIVE'
    });
    setSelectedItem(null);
    setModalMode('create');
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      level: item.level,
      duration: item.duration,
      schedule: item.schedule,
      shortDescription: item.shortDescription,
      fullDescription: item.fullDescription,
      priceEstimate: item.priceEstimate,
      status: item.status
    });
    setModalMode('edit');
  };

  const handleOpenView = (item) => {
    setSelectedItem(item);
    setModalMode('view');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      await programService.create(formData);
    } else if (modalMode === 'edit' && selectedItem) {
      await programService.update(selectedItem.id, formData);
    }
    setModalMode(null);
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await programService.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  };

  const columns = [
    {
      header: 'Judul Program',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{row.title}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{row.category}</div>
        </div>
      )
    },
    { header: 'Tingkat', accessor: 'level' },
    { header: 'Durasi', accessor: 'duration' },
    { header: 'Biaya Program', accessor: 'priceEstimate' },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    }
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
        searchPlaceholder="Cari nama program / kategori..."
        filterValue={filterLevel}
        onFilterChange={setFilterLevel}
        filterOptions={[
          { value: 'ALL', label: 'Semua Tingkat' },
          { value: 'N5', label: 'Tingkat N5' },
          { value: 'N4', label: 'Tingkat N4' },
          { value: 'N3', label: 'Tingkat N3' },
          { value: 'SSW', label: 'Tokutei Ginou' }
        ]}
        onAddNew={handleOpenCreate}
        addNewLabel="Tambah Program Baru"
        onView={handleOpenView}
        onEdit={handleOpenEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Tambah Program Pelatihan' : 'Edit Program Pelatihan'}
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="program-form" className="btn btn-primary btn-sm">
              Simpan Data Program
            </button>
          </>
        }
      >
        <form id="program-form" onSubmit={handleSave}>
          <FormField
            label="Judul Program"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Contoh: Bahasa Jepang Dasar (N5)"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Kategori"
              type="select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: 'Dasar & Pondasi', label: 'Dasar & Pondasi' },
                { value: 'Intensif Lanjutan', label: 'Intensif Lanjutan' },
                { value: 'Karier & Sertifikasi', label: 'Karier & Sertifikasi' },
                { value: 'Tingkat Menengah', label: 'Tingkat Menengah' },
                { value: 'Keterampilan Komunikasi', label: 'Keterampilan Komunikasi' }
              ]}
            />
            <FormField
              label="Tingkat Level"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              placeholder="Contoh: N5 Beginner"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Durasi Pelatihan"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="Contoh: 3 Bulan (120 Jam)"
            />
            <FormField
              label="Estimasi Biaya"
              value={formData.priceEstimate}
              onChange={(e) => setFormData({ ...formData, priceEstimate: e.target.value })}
              placeholder="Contoh: Rp 3.500.000"
            />
          </div>

          <FormField
            label="Jadwal Pelatihan"
            value={formData.schedule}
            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
            placeholder="Contoh: Senin - Kamis (08.30 - 12.00 WIB)"
          />

          <FormField
            label="Deskripsi Singkat"
            type="textarea"
            rows={2}
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            placeholder="Ringkasan 1-2 kalimat untuk preview card..."
          />

          <FormField
            label="Deskripsi Lengkap"
            type="textarea"
            rows={4}
            value={formData.fullDescription}
            onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
            placeholder="Uraian detail silabus dan tujuan kompetensi..."
          />

          <FormField
            label="Status Program"
            type="select"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'ACTIVE', label: 'Aktif (Ditampilkan Publik)' },
              { value: 'INACTIVE', label: 'Non-aktif (Diarsipkan)' }
            ]}
          />
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={modalMode === 'view'}
        onClose={() => setModalMode(null)}
        title="Detail Program Pelatihan"
        footer={
          <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
            Tutup
          </button>
        }
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>JUDUL PROGRAM</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>{selectedItem.title}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>KATEGORI</div>
                <div>{selectedItem.category}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>TINGKAT</div>
                <div>{selectedItem.level}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>JADWAL & DURASI</div>
              <div>{selectedItem.schedule} ({selectedItem.duration})</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>DESKRIPSI LENGKAP</div>
              <p style={{ color: '#475569', lineHeight: 1.6, margin: '0.35rem 0 0 0' }}>{selectedItem.fullDescription}</p>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>STATUS</div>
              <div style={{ marginTop: '0.25rem' }}>
                <StatusBadge status={selectedItem.status} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Program Pelatihan"
        message={`Apakah Anda yakin ingin menghapus program '${deleteTarget?.title}'? Data ini akan dihapus dari katalog program.`}
      />
    </div>
  );
}
