import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import { opportunityService } from '../../services/dataService';

export default function AdminOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [search, setSearch] = useState('');
  const [filterSector, setFilterSector] = useState('ALL');
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    sector: 'Caregiving / Perawat Lansia',
    location: 'Tokyo, Kanagawa, & Chiba',
    salaryRange: '¥190.000 - ¥245.000 / Bulan',
    languageReq: 'JLPT N4 atau JFT-Basic A2',
    ageReq: '19 - 35 Tahun',
    description: '',
    status: 'OPEN'
  });

  const loadData = () => {
    opportunityService.getAll().then((data) => setOpportunities(data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = opportunities.filter((o) => {
    const matchSearch = o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.location.toLowerCase().includes(search.toLowerCase());
    const matchSector = filterSector === 'ALL' || o.sector === filterSector;
    return matchSearch && matchSector;
  });

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      sector: 'Caregiving / Perawat Lansia',
      location: 'Tokyo & Kanagawa',
      salaryRange: '¥190.000 - ¥240.000 / Bulan',
      languageReq: 'JLPT N4 / JFT-Basic A2',
      ageReq: '19 - 35 Tahun',
      description: '',
      status: 'OPEN'
    });
    setSelectedItem(null);
    setModalMode('create');
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      sector: item.sector,
      location: item.location,
      salaryRange: item.salaryRange,
      languageReq: item.languageReq,
      ageReq: item.ageReq,
      description: item.description,
      status: item.status
    });
    setModalMode('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      await opportunityService.create(formData);
    } else if (modalMode === 'edit' && selectedItem) {
      await opportunityService.update(selectedItem.id, formData);
    }
    setModalMode(null);
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await opportunityService.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  };

  const columns = [
    {
      header: 'Judul Peluang Kerja',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{row.title}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{row.sector}</div>
        </div>
      )
    },
    { header: 'Lokasi Penempatan', accessor: 'location' },
    { header: 'Estimasi Gaji', accessor: 'salaryRange' },
    { header: 'Syarat Bahasa', accessor: 'languageReq' },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
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
        searchPlaceholder="Cari judul lowongan / lokasi..."
        filterValue={filterSector}
        onFilterChange={setFilterSector}
        filterOptions={[
          { value: 'ALL', label: 'Semua Sektor' },
          { value: 'Caregiving / Perawat Lansia', label: 'Caregiving (Kaigo)' },
          { value: 'Manufacturing / Permesinan', label: 'Manufaktur' },
          { value: 'Food Manufacturing & Catering', label: 'Pengolahan Makanan' },
          { value: 'Agriculture / Pertanian', label: 'Pertanian' },
          { value: 'Hospitality & Tourism', label: 'Perhotelan' }
        ]}
        onAddNew={handleOpenCreate}
        addNewLabel="Tambah Peluang Kerja"
        onView={(row) => {
          setSelectedItem(row);
          setModalMode('view');
        }}
        onEdit={handleOpenEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Tambah Peluang Kerja Jepang' : 'Edit Peluang Kerja'}
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="opportunity-form" className="btn btn-primary btn-sm">
              Simpan Peluang Kerja
            </button>
          </>
        }
      >
        <form id="opportunity-form" onSubmit={handleSave}>
          <FormField
            label="Judul Peluang / Posisi"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Contoh: Caregiver & Perawat Lansia (Kaigo)"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Sektor Bidang"
              type="select"
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              options={[
                { value: 'Caregiving / Perawat Lansia', label: 'Caregiving (Kaigo)' },
                { value: 'Manufacturing / Permesinan', label: 'Manufaktur' },
                { value: 'Food Manufacturing & Catering', label: 'Pengolahan Makanan' },
                { value: 'Agriculture / Pertanian', label: 'Pertanian' },
                { value: 'Hospitality & Tourism', label: 'Perhotelan' },
                { value: 'Construction / Konstruksi', label: 'Konstruksi' }
              ]}
            />
            <FormField
              label="Lokasi Prefektur Jepang"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Contoh: Tokyo, Kanagawa, & Chiba"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Estimasi Rentang Penghasilan"
              value={formData.salaryRange}
              onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
              placeholder="Contoh: ¥190.000 - ¥240.000 / Bulan"
            />
            <FormField
              label="Batasan Usia"
              value={formData.ageReq}
              onChange={(e) => setFormData({ ...formData, ageReq: e.target.value })}
              placeholder="Contoh: 19 - 35 Tahun"
            />
          </div>

          <FormField
            label="Kriteria Bahasa Jepang"
            value={formData.languageReq}
            onChange={(e) => setFormData({ ...formData, languageReq: e.target.value })}
            placeholder="Contoh: JLPT N4 / JFT-Basic A2"
          />

          <FormField
            label="Deskripsi Posisi & Tanggung Jawab"
            type="textarea"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <FormField
            label="Status Perekrutan"
            type="select"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'OPEN', label: 'OPEN (Perekrutan Aktif)' },
              { value: 'CLOSED', label: 'CLOSED (Perekrutan Ditutup)' },
              { value: 'DRAFT', label: 'DRAFT (Disimpan)' }
            ]}
          />
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={modalMode === 'view'}
        onClose={() => setModalMode(null)}
        title="Detail Peluang Kerja"
        footer={
          <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
            Tutup
          </button>
        }
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>POSISI & SEKTOR</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedItem.title} ({selectedItem.sector})</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>LOKASI & ESTIMASI GAJI</div>
              <div>{selectedItem.location} • {selectedItem.salaryRange}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>PERSYARATAN</div>
              <div>Bahasa: {selectedItem.languageReq} | Usia: {selectedItem.ageReq}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>DESKRIPSI</div>
              <p style={{ color: '#475569', lineHeight: 1.6, margin: '0.35rem 0 0 0' }}>{selectedItem.description}</p>
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
        title="Hapus Peluang Kerja"
        message={`Apakah Anda yakin ingin menghapus peluang kerja '${deleteTarget?.title}'?`}
      />
    </div>
  );
}
