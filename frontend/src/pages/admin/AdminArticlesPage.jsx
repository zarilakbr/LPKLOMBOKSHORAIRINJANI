import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import { articleService } from '../../services/dataService';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Persiapan Kerja',
    author: 'Tim Litbang LPK Lombok Shorai Rinjani',
    excerpt: '',
    content: '',
    readTime: '5 Menit Baca',
    status: 'PUBLISHED',
    tags: 'SSW, Jepang, Karier'
  });

  const loadData = () => {
    articleService.getAll().then((data) => setArticles(data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'ALL' || a.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      category: 'Persiapan Kerja',
      author: 'Tim Litbang LPK Lombok Shorai Rinjani',
      excerpt: '',
      content: '',
      readTime: '5 Menit Baca',
      status: 'PUBLISHED',
      tags: 'SSW, Jepang, Visa'
    });
    setSelectedItem(null);
    setModalMode('create');
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      author: item.author,
      excerpt: item.excerpt,
      content: item.content,
      readTime: item.readTime,
      status: item.status,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags
    });
    setModalMode('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: typeof formData.tags === 'string' ? formData.tags.split(',').map((t) => t.trim()) : formData.tags,
      publishedDate: new Date().toISOString().slice(0, 10),
      thumbnail: selectedItem?.thumbnail || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'
    };

    if (modalMode === 'create') {
      await articleService.create(payload);
    } else if (modalMode === 'edit' && selectedItem) {
      await articleService.update(selectedItem.id, payload);
    }
    setModalMode(null);
    loadData();
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await articleService.delete(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  };

  const columns = [
    {
      header: 'Judul Artikel & Excerpt',
      render: (row) => (
        <div style={{ maxWidth: '420px' }}>
          <div style={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>{row.title}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {row.excerpt}
          </div>
        </div>
      )
    },
    { header: 'Kategori', accessor: 'category' },
    { header: 'Penulis', accessor: 'author' },
    { header: 'Tanggal Rilis', accessor: 'publishedDate' },
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
        searchPlaceholder="Cari judul artikel / penulis..."
        filterValue={filterCat}
        onFilterChange={setFilterCat}
        filterOptions={[
          { value: 'ALL', label: 'Semua Kategori' },
          { value: 'Persiapan Kerja', label: 'Persiapan Kerja' },
          { value: 'Tips Belajar', label: 'Tips Belajar' },
          { value: 'Budaya Jepang', label: 'Budaya Jepang' }
        ]}
        onAddNew={handleOpenCreate}
        addNewLabel="Tulis Artikel Baru"
        onView={(row) => {
          setSelectedItem(row);
          setModalMode('view');
        }}
        onEdit={handleOpenEdit}
        onDelete={(row) => setDeleteTarget(row)}
      />

      {/* Modal Create/Edit */}
      <Modal
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Tulis Artikel Baru' : 'Edit Artikel'}
        maxWidth="720px"
        footer={
          <>
            <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" form="article-form" className="btn btn-primary btn-sm">
              Simpan & Terbitkan
            </button>
          </>
        }
      >
        <form id="article-form" onSubmit={handleSave}>
          <FormField
            label="Judul Artikel"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Judul artikel informatif..."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Kategori"
              type="select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { value: 'Persiapan Kerja', label: 'Persiapan Kerja' },
                { value: 'Tips Belajar', label: 'Tips Belajar' },
                { value: 'Budaya Jepang', label: 'Budaya Jepang' },
                { value: 'Informasi LPK', label: 'Informasi LPK' },
                { value: 'Student Story', label: 'Student Story' }
              ]}
            />
            <FormField
              label="Nama Penulis"
              required
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>

          <FormField
            label="Ringkasan Pendek (Excerpt)"
            type="textarea"
            rows={2}
            required
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="Ringkasan untuk pengantar bacaan..."
          />

          <FormField
            label="Isi Konten Artikel (Mendukung Markdown)"
            type="textarea"
            rows={6}
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Gunakan ## untuk subjudul..."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField
              label="Tag Topik (Pisahkan koma)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="SSW, Jepang, JLPT"
            />
            <FormField
              label="Status Publikasi"
              type="select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'PUBLISHED', label: 'PUBLISHED (Terbit Publik)' },
                { value: 'DRAFT', label: 'DRAFT (Disimpan)' },
                { value: 'ARCHIVED', label: 'ARCHIVED (Diarsipkan)' }
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={modalMode === 'view'}
        onClose={() => setModalMode(null)}
        title="Pratinjau Artikel"
        maxWidth="720px"
        footer={
          <button type="button" onClick={() => setModalMode(null)} className="btn btn-outline btn-sm">
            Tutup
          </button>
        }
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <StatusBadge status={selectedItem.status} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.5rem 0' }}>{selectedItem.title}</h2>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Oleh {selectedItem.author} • {selectedItem.publishedDate} • {selectedItem.category}
              </div>
            </div>
            <p style={{ fontStyle: 'italic', color: '#475569', lineHeight: 1.6 }}>{selectedItem.excerpt}</p>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Artikel"
        message={`Apakah Anda yakin ingin menghapus artikel '${deleteTarget?.title}'?`}
      />
    </div>
  );
}
