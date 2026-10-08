import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import FormField from '../../components/admin/FormField';
import PhotoUrlField from '../../components/admin/PhotoUrlField';
import { articleService } from '../../services/dataService';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('ALL');
  const [modalMode, setModalMode] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Persiapan Kerja',
    author: 'Tim Litbang LPK Lombok Shorai Rinjani',
    excerpt: '',
    content: '',
    readTime: '5 Menit Baca',
    thumbnail: '',
    status: 'PUBLISHED',
    tags: 'SSW, Jepang, Karier'
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await articleService.getAll();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load articles:', err);
      setError('Gagal memuat data artikel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = (articles || []).filter((a) => {
    const title = String(a?.title ?? '').toLowerCase();
    const author = String(a?.author ?? '').toLowerCase();
    const searchTerm = String(search ?? '').toLowerCase();

    const matchSearch = title.includes(searchTerm) || author.includes(searchTerm);
    const matchCat = filterCat === 'ALL' || a?.category === filterCat;
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
      thumbnail: '',
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
      thumbnail: item.thumbnail || '',
      status: item.status,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags
    });
    setModalMode('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);
    try {
      const payload = {
        ...formData,
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : formData.tags,
        publishedDate: selectedItem?.publishedDate || new Date().toISOString().slice(0, 10),
        thumbnail: formData.thumbnail && typeof formData.thumbnail === 'string' && formData.thumbnail.trim() ? formData.thumbnail.trim() : null
      };

      if (modalMode === 'create') {
        await articleService.create(payload);
        setFeedback({ type: 'success', message: 'Artikel baru berhasil dibuat.' });
      } else if (modalMode === 'edit' && selectedItem) {
        await articleService.update(selectedItem.id, payload);
        setFeedback({ type: 'success', message: 'Artikel berhasil diperbarui.' });
      }
      setModalMode(null);
      await loadData();
    } catch (err) {
      console.error('Failed to save article:', err);
      let errMsg = 'Gagal menyimpan artikel.';
      if (err.response?.data?.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat().join(' ');
        if (validationErrors) errMsg = validationErrors;
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setActionLoading(false);
    }
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
      {feedback && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: feedback.type === 'success' ? '#16A34A' : '#EF4444',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{feedback.message}</span>
        </div>
      )}

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
            <button
              type="button"
              onClick={() => setModalMode(null)}
              className="btn btn-outline btn-sm"
              disabled={actionLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              form="article-form"
              className="btn btn-primary btn-sm"
              disabled={actionLoading}
            >
              {actionLoading ? 'Menyimpan...' : 'Simpan & Terbitkan'}
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

          <PhotoUrlField
            label="Link Foto Thumbnail / Cover (Opsional)"
            value={formData.thumbnail || ''}
            onChange={(val) => setFormData({ ...formData, thumbnail: val })}
            placeholder="https://images.unsplash.com/... atau URL foto lainnya"
            helpText="Gunakan tautan gambar langsung (URL valid berawalan http:// atau https://, maksimal 255 karakter)."
            previewHeight="120px"
          />

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
            {selectedItem.thumbnail && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '0.35rem' }}>THUMBNAIL / COVER</div>
                <img
                  src={selectedItem.thumbnail}
                  alt={selectedItem.title}
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}
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
