import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import { classService } from '../../services/dataService';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    className: '',
    programTitle: 'Bahasa Jepang Dasar (N5)',
    instructor: '',
    level: 'N5 Beginner',
    schedule: 'Senin - Kamis, 08.30 - 12.00 WIB',
    startDate: '',
    endDate: '',
    capacity: 20,
    currentStudents: 0,
    location: 'Ruang Sakura (Lantai 2)',
    status: 'OPEN'
  });

  const loadData = () => {
    classService.getAll().then((data) => setClasses(data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = classes.filter((c) => {
    const matchSearch = c.className.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase()) ||
      c.programTitle.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleOpenCreate = () => {
    setFormData({
      className: '',
      programTitle: 'Bahasa Jepang Dasar (N5)',
      instructor: '',
      level: 'N5 Beginner',
      schedule: 'Senin - Kamis, 08.30 - 12.00 WIB',
      startDate: '2026-11-01',
      endDate: '2027-02-15',
      capacity: 20,
      currentStudents: 0,
      location: 'Ruang Sakura (Lantai 2)',
      status: 'OPEN'
    });
    setSelectedItem(null);
    setModalMode('create');
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      className: item.className,
      programTitle: item.programTitle,
      instructor: item.instructor,
      level: item.level,
      schedule: item.schedule,
      startDate: item.startDate,
      endDate: item.endDate,
      capacity: item.capacity,
      currentStudents: item.currentStudents,
      location: item.location,
      status: item.status
    });
    setModalMode('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      await classService.create(formData);
    } else if (modalMode === 'edit' && selectedItem) {
      await classService.update(selectedItem.id, formData);
    }
    setModalMode(null);
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await classService.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  };

  const columns = [
    {
      header: 'Nama Batch & Kelas',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{row.className}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{row.programTitle}</div>
        </div>
      )
    },
    { header: 'Pengajar (Sensei)', accessor: 'instructor' },
    { header: 'Jadwal Hari & Jam', accessor: 'schedule' },
    {
      header: 'Kapasitas Siswa',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700 }}>{row.currentStudents}</span> / {row.capacity} Siswa
        </div>
      )
    },
    { header: 'Lokasi Ruangan', accessor: 'location' },
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
        searchPlaceholder="Cari nama batch / instruktur..."
        filterValue={filterStatus}
        onFilterChange={setFilterStatus}
        filterOptions={[
          { value: 'ALL', label: 'Semua Status' },
          { value: 'OPEN', label: 'Pendaftaran Dibuka' },
          { value: 'FULL', label: 'Kuota Penuh' },
          { value: 'UPCOMING', label: 'Akan Datang' },
          { value: 'ONGOING', label: 'Sedang Berjalan' },
          { value: 'COMPLETED', label: 'Selesai' }
        ]}
        onAddNew={handleOpenCreate}
        addNewLabel="Buka Batch Baru"
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
        title={modalMode === 'create' ? 'Buka Batch Angkatan Baru' : 'Edit Jadwal Kelas'}
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="class-form" className="btn btn-primary btn-sm">
              Simpan Batch
            </button>
          </>
        }
      >
        <form id="class-form" onSubmit={handleSave}>
          <FormField
            label="Nama Batch Kelas"
            required
            value={formData.className}
            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
            placeholder="Contoh: Batch 50 - Dasar N5 Pagi"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Induk Program"
              value={formData.programTitle}
              onChange={(e) => setFormData({ ...formData, programTitle: e.target.value })}
            />
            <FormField
              label="Instruktur / Sensei"
              required
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              placeholder="Nama sensei pembimbing"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Tanggal Mulai"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <FormField
              label="Tanggal Selesai"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Kapasitas Maksimal"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            />
            <FormField
              label="Siswa Terdaftar Saat Ini"
              type="number"
              value={formData.currentStudents}
              onChange={(e) => setFormData({ ...formData, currentStudents: Number(e.target.value) })}
            />
          </div>

          <FormField
            label="Jadwal Pembelajaran"
            value={formData.schedule}
            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
            placeholder="Contoh: Senin - Kamis, 08.30 - 12.00 WIB"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Lokasi Ruangan"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <FormField
              label="Status Batch"
              type="select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'OPEN', label: 'Open (Pendaftaran Dibuka)' },
                { value: 'FULL', label: 'Full (Kuota Penuh)' },
                { value: 'UPCOMING', label: 'Upcoming (Akan Datang)' },
                { value: 'ONGOING', label: 'Ongoing (Sedang Berjalan)' },
                { value: 'COMPLETED', label: 'Completed (Selesai)' }
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        isOpen={modalMode === 'view'}
        onClose={() => setModalMode(null)}
        title="Detail Kelas & Angkatan"
        footer={
          <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
            Tutup
          </button>
        }
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>NAMA BATCH</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedItem.className}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>PROGRAM</div>
                <div>{selectedItem.programTitle}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>PENGAJAR</div>
                <div>{selectedItem.instructor}</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>PERIODE BELAJAR</div>
              <div>{selectedItem.startDate} s.d {selectedItem.endDate}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>KAPASITAS & RUANGAN</div>
              <div>{selectedItem.currentStudents} dari {selectedItem.capacity} Kursi ({selectedItem.location})</div>
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
        title="Hapus Batch Kelas"
        message={`Apakah Anda yakin ingin menghapus '${deleteTarget?.className}'?`}
      />
    </div>
  );
}
