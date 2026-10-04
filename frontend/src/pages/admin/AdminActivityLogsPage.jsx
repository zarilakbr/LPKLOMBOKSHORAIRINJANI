import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { activityLogService } from '../../services/dataService';

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await activityLogService.getAll();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
      setError('Gagal memuat catatan aktivitas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = (logs || []).filter((l) => {
    const user = String(l?.user ?? '').toLowerCase();
    const description = String(l?.description ?? '').toLowerCase();
    const module = String(l?.module ?? '').toLowerCase();
    const searchTerm = String(search ?? '').toLowerCase();

    const matchSearch =
      user.includes(searchTerm) ||
      description.includes(searchTerm) ||
      module.includes(searchTerm);
    const matchAction = filterAction === 'ALL' || l?.action === filterAction;
    return matchSearch && matchAction;
  });

  const columns = [
    { header: 'Waktu Kejadian', accessor: 'timestamp', width: '170px' },
    {
      header: 'Pengguna (Staff/Admin)',
      render: (row) => <span style={{ fontWeight: 700, color: '#0F172A' }}>{row.user}</span>
    },
    {
      header: 'Tindakan (Action)',
      render: (row) => <StatusBadge status={row.action} />
    },
    {
      header: 'Modul',
      render: (row) => (
        <span style={{ padding: '0.2rem 0.5rem', backgroundColor: '#F1F5F9', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
          {row.module}
        </span>
      )
    },
    { header: 'Deskripsi Rincian', accessor: 'description' },
    { header: 'Alamat IP', accessor: 'ipAddress', width: '130px' }
  ];

  return (
    <div>
      <div
        style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: '#64748B'
        }}
      >
        <strong>Audit Trail:</strong> Seluruh aktivitas mutasi data administratif dicatat secara transparan untuk kepatuhan regulasi dan keamanan sistem.
      </div>

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
        searchPlaceholder="Cari log aktivitas, nama user, deskripsi..."
        filterValue={filterAction}
        onFilterChange={setFilterAction}
        filterOptions={[
          { value: 'ALL', label: 'Semua Tindakan' },
          { value: 'LOGIN', label: 'LOGIN' },
          { value: 'CREATE', label: 'CREATE' },
          { value: 'UPDATE', label: 'UPDATE' },
          { value: 'DELETE', label: 'DELETE' },
          { value: 'STATUS_CHANGE', label: 'STATUS_CHANGE' },
          { value: 'PUBLISH', label: 'PUBLISH' }
        ]}
      />
    </div>
  );
}
