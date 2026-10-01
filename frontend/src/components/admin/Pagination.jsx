import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange, totalItems = 0 }) {
  if (totalPages <= 1) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#64748B' }}>
        <span>Menampilkan total {totalItems} data</span>
        <span>Halaman 1 dari 1</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        borderTop: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}
    >
      <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
        Menampilkan total <strong>{totalItems}</strong> data
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '0.45rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #CBD5E1',
            backgroundColor: '#FFFFFF',
            color: currentPage === 1 ? '#94A3B8' : '#1E293B',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.85rem'
          }}
        >
          <ChevronLeft size={16} />
          <span>Sebelumnya</span>
        </button>

        <span style={{ padding: '0 0.5rem', fontSize: '0.88rem', fontWeight: 600 }}>
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '0.45rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #CBD5E1',
            backgroundColor: '#FFFFFF',
            color: currentPage === totalPages ? '#94A3B8' : '#1E293B',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.85rem'
          }}
        >
          <span>Berikutnya</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
