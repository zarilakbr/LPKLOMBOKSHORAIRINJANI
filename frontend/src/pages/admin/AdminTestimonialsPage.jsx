import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import { testimonialService } from '../../services/dataService';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    program: 'Persiapan Kerja Tokutei Ginou (SSW)',
    placement: '',
    year: 'Alumni Angkatan 2026',
    quote: '',
    badge: 'SSW Manufaktur',
    status: 'ACTIVE'
  });

  const loadData = () => {
    testimonialService.getAll().then((data) => setTestimonials(data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = testimonials.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.placement.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      program: 'Persiapan Kerja Tokutei Ginou (SSW)',
      placement: 'Tokyo Metropolitan',
      year: 'Alumni Angkatan 2026',
      quote: '',
      badge: 'SSW Kaigo',
      status: 'ACTIVE'
    });
    setSelectedItem(null);
    setModalMode('create');
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      program: item.program,
      placement: item.placement,
      year: item.year,
      quote: item.quote,
      badge: item.badge,
      status: item.status || 'ACTIVE'
    });
    setModalMode('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      await testimonialService.create(formData);
    } else if (modalMode === 'edit' && selectedItem) {
      await testimonialService.update(selectedItem.id, formData);
    }
    setModalMode(null);
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await testimonialService.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  };

  const columns = [
    {
      header: 'Nama Alumni',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt={row.name}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 700, color: '#0F172A' }}>{row.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{row.year}</div>
          </div>
        </div>
      )
    },
    { header: 'Program Diikuti', accessor: 'program' },
    { header: 'Penempatan di Jepang', accessor: 'placement' },
    {
      header: 'Kutipan',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic' }}>
          "{row.quote.slice(0, 70)}..."
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status || 'ACTIVE'} />
    }
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={filtered}
        totalItems={filtered.length}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama alumni / penempatan..."
        onAddNew={handleOpenCreate}
        addNewLabel="Tambah Testimoni"
        onView={(row) => {
          setSelectedItem(row);
          setModalMode('view');
        }}
        onEdit={handleOpenEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      {/* Modal Form */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Tambah Cerita Alumni' : 'Edit Testimoni'}
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="testi-form" className="btn btn-primary btn-sm">
              Simpan Testimoni
            </button>
          </>
        }
      >
        <form id="testi-form" onSubmit={handleSave}>
          <FormField
            label="Nama Lengkap Alumni"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Bayu Pratama"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Program yang Diikuti"
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
            />
            <FormField
              label="Tahun Angkatan"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="Contoh: Alumni Angkatan 2025"
            />
          </div>

          <FormField
            label="Kota & Bidang Penempatan di Jepang"
            required
            value={formData.placement}
            onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
            placeholder="Contoh: Caregiver di Yokohama, Kanagawa"
          />

          <FormField
            label="Isi Kutipan / Pengalaman"
            type="textarea"
            rows={3}
            required
            value={formData.quote}
            onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
          />

          <FormField
            label="Status Publikasi"
            type="select"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'ACTIVE', label: 'Aktif (Tampil di Beranda & Alumni)' },
              { value: 'INACTIVE', label: 'Non-aktif (Disembunyikan)' }
            ]}
          />
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={modalMode === 'view'}
        onClose={() => setModalMode(null)}
        title="Detail Testimoni Alumni"
        footer={
          <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
            Tutup
          </button>
        }
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                src={selectedItem.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={selectedItem.name}
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{selectedItem.name}</div>
                <div style={{ color: 'var(--vermilion)', fontWeight: 600 }}>{selectedItem.placement}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{selectedItem.program} • {selectedItem.year}</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: 'var(--radius-sm)', fontStyle: 'italic', lineHeight: 1.7, border: '1px solid #E2E8F0' }}>
              "{selectedItem.quote}"
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Testimoni Alumni"
        message={`Apakah Anda yakin ingin menghapus kutipan testimoni dari '${deleteTarget?.name}'?`}
      />
    </div>
  );
}
