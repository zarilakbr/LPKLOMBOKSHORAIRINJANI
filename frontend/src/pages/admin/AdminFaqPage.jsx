import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import { faqService } from '../../services/dataService';

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'Program',
    order: 1,
    status: 'ACTIVE'
  });

  const loadData = () => {
    faqService.getAll().then((data) => setFaqs(data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = faqs.filter((f) => {
    const matchSearch = f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'ALL' || f.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleOpenCreate = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'Program',
      order: faqs.length + 1,
      status: 'ACTIVE'
    });
    setSelectedItem(null);
    setModalMode('create');
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category,
      order: item.order || 1,
      status: item.status || 'ACTIVE'
    });
    setModalMode('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      await faqService.create(formData);
    } else if (modalMode === 'edit' && selectedItem) {
      await faqService.update(selectedItem.id, formData);
    }
    setModalMode(null);
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await faqService.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  };

  const columns = [
    {
      header: 'Pertanyaan & Jawaban',
      render: (row) => (
        <div style={{ maxWidth: '480px' }}>
          <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>{row.question}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {row.answer}
          </div>
        </div>
      )
    },
    { header: 'Kategori', accessor: 'category' },
    { header: 'Urutan', accessor: 'order' },
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
        searchPlaceholder="Cari pertanyaan / jawaban FAQ..."
        filterValue={filterCat}
        onFilterChange={setFilterCat}
        filterOptions={[
          { value: 'ALL', label: 'Semua Kategori' },
          { value: 'Program', label: 'Program' },
          { value: 'Registration', label: 'Registration' },
          { value: 'Class', label: 'Class' },
          { value: 'Japanese Language', label: 'Japanese Language' },
          { value: 'Japan Preparation', label: 'Japan Preparation' }
        ]}
        onAddNew={handleOpenCreate}
        addNewLabel="Tambah FAQ Baru"
        onView={(row) => {
          setSelectedItem(row);
          setModalMode('view');
        }}
        onEdit={handleOpenEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      {/* Modal */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Tambah Pertanyaan FAQ' : 'Edit FAQ'}
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="faq-form" className="btn btn-primary btn-sm">
              Simpan FAQ
            </button>
          </>
        }
      >
        <form id="faq-form" onSubmit={handleSave}>
          <FormField
            label="Pertanyaan"
            required
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="Tuliskan pertanyaan umum..."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Kategori FAQ"
              type="select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: 'Program', label: 'Program & Kurikulum' },
                { value: 'Registration', label: 'Alur Pendaftaran' },
                { value: 'Class', label: 'Jadwal & Asrama' },
                { value: 'Japanese Language', label: 'Ujian Bahasa Jepang' },
                { value: 'Japan Preparation', label: 'Persiapan Kerja & Visa' }
              ]}
            />
            <FormField
              label="Nomor Urutan"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
            />
          </div>

          <FormField
            label="Jawaban Lengkap"
            type="textarea"
            rows={4}
            required
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            placeholder="Tuliskan penjelasan jawaban secara transparan..."
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus FAQ"
        message={`Apakah Anda yakin ingin menghapus pertanyaan FAQ ini?`}
      />
    </div>
  );
}
