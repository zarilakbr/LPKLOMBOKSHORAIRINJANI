import React from 'react';
import { Eye, Pencil, Trash2, Plus } from 'lucide-react';
import SearchInput from './SearchInput';
import FilterDropdown from './FilterDropdown';
import Pagination from './Pagination';
import EmptyState from './EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  totalItems = 0,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Cari data...',
  filterValue,
  onFilterChange,
  filterOptions = [],
  onAddNew,
  addNewLabel = 'Tambah Data',
  onView,
  onEdit,
  onDelete,
  emptyTitle,
  emptyDesc
}) {
  const showToolbar = onSearchChange || filterOptions.length > 0 || onAddNew;

  return (
    <div className="admin-table-container">
      {/* Table Toolbar */}
      {showToolbar && (
        <div className="admin-table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            {onSearchChange && (
              <SearchInput
                value={searchQuery}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
              />
            )}
            {filterOptions.length > 0 && onFilterChange && (
              <FilterDropdown
                value={filterValue}
                onChange={onFilterChange}
                options={filterOptions}
              />
            )}
          </div>

          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} />
              <span>{addNewLabel}</span>
            </button>
          )}
        </div>
      )}

      {/* Table Content */}
      {data.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDesc}
          actionLabel={onAddNew ? addNewLabel : undefined}
          onAction={onAddNew}
        />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} style={{ width: col.width, textAlign: col.align || 'left' }}>
                    {col.header}
                  </th>
                ))}
                {(onView || onEdit || onDelete) && (
                  <th style={{ width: '120px', textAlign: 'right' }}>Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rIdx) => (
                <tr key={row.id || rIdx}>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} style={{ textAlign: col.align || 'left' }}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        {onView && (
                          <button
                            type="button"
                            onClick={() => onView(row)}
                            className="admin-action-btn"
                            title="Lihat Rincian"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            className="admin-action-btn"
                            title="Edit Data"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(row)}
                            className="admin-action-btn delete"
                            title="Hapus Data"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalItems > 0 && onPageChange && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
