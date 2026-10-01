import React, { useState, useEffect } from 'react';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { activityLogService } from '../../services/dataService';

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    activityLogService.getAll().then((data) => setLogs(data));
  }, []);

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.module.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === 'ALL' || l.action === filterAction;
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
