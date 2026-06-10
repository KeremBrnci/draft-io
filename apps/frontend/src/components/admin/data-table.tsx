'use client';

import type { ReactNode } from 'react';

import { Skeleton } from '@/components/admin/skeleton';

export interface DataTableColumn<T> {
  readonly id: string;
  readonly header: string;
  readonly cell: (row: T) => ReactNode;
  readonly sortable?: boolean;
  readonly align?: 'left' | 'right' | 'center';
}

export interface DataTablePagination {
  readonly page: number;
  readonly totalPages: number;
  readonly totalItems?: number;
  readonly onPageChange: (page: number) => void;
  /** Disables pagination controls while the next page is loading. */
  readonly fetching?: boolean;
}

interface DataTableProps<T> {
  readonly columns: readonly DataTableColumn<T>[];
  readonly data: readonly T[];
  readonly rowKey: (row: T) => string;
  /** True only for the first load when there is no data to show yet. */
  readonly loading?: boolean;
  /** True while refreshing data; keeps the current rows visible. */
  readonly fetching?: boolean;
  readonly emptyMessage?: string;
  readonly sortField?: string;
  readonly sortDirection?: 'asc' | 'desc';
  readonly onSort?: (field: string) => void;
  readonly pagination?: DataTablePagination;
  readonly skeletonRows?: number;
}

function sortIndicator(active: boolean, direction: 'asc' | 'desc'): string {
  if (!active) {
    return '↕';
  }

  return direction === 'asc' ? '↑' : '↓';
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  fetching = false,
  emptyMessage = 'No records found.',
  sortField,
  sortDirection = 'asc',
  onSort,
  pagination,
  skeletonRows = 10,
}: DataTableProps<T>): React.ReactElement {
  const showInitialLoading = loading && data.length === 0;
  const showRows = data.length > 0;
  const showEmpty = !showInitialLoading && !fetching && data.length === 0;
  const isPaginationBusy = fetching || pagination?.fetching === true;

  return (
    <div className={`admin-table-wrap${fetching ? ' admin-table-wrap--fetching' : ''}`}>
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => {
              const isSortable = column.sortable === true && onSort !== undefined;
              const isActive = sortField === column.id;

              return (
                <th
                  key={column.id}
                  className={isSortable ? 'admin-table__sortable' : undefined}
                  style={{ textAlign: column.align ?? 'left' }}
                  onClick={
                    isSortable
                      ? () => {
                          onSort(column.id);
                        }
                      : undefined
                  }
                >
                  {column.header}
                  {isSortable ? ` ${sortIndicator(isActive, sortDirection)}` : ''}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {showInitialLoading
            ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="admin-table__skeleton-row">
                  {columns.map((column, colIndex) => (
                    <td key={column.id} style={{ textAlign: column.align ?? 'left' }}>
                      <Skeleton
                        className="admin-skeleton--td"
                        tone={colIndex === 0 ? 'strong' : 'default'}
                      />
                    </td>
                  ))}
                </tr>
              ))
            : null}
          {showEmpty ? (
            <tr>
              <td colSpan={columns.length} className="admin-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : null}
          {showRows
            ? data.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((column) => (
                    <td key={column.id} style={{ textAlign: column.align ?? 'left' }}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            : null}
        </tbody>
      </table>

      {pagination !== undefined ? (
        <div
          className={`admin-pagination${showInitialLoading ? ' admin-pagination--skeleton' : ''}`}
        >
          {showInitialLoading ? (
            <>
              <Skeleton className="admin-skeleton--pagination-text" />
              <div className="admin-pagination__actions-skeleton">
                <Skeleton className="admin-skeleton--button" />
                <Skeleton className="admin-skeleton--button" />
              </div>
            </>
          ) : (
            <>
              <span>
                Sayfa {pagination.page} / {pagination.totalPages}
                {pagination.totalItems !== undefined
                  ? ` · ${pagination.totalItems.toLocaleString('tr-TR')} kayıt`
                  : ''}
                {isPaginationBusy ? ' · güncelleniyor…' : ''}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="admin-btn admin-btn--sm"
                  disabled={pagination.page <= 1 || isPaginationBusy}
                  onClick={(event) => {
                    event.preventDefault();
                    pagination.onPageChange(pagination.page - 1);
                  }}
                >
                  Önceki
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--sm"
                  disabled={pagination.page >= pagination.totalPages || isPaginationBusy}
                  onClick={(event) => {
                    event.preventDefault();
                    pagination.onPageChange(pagination.page + 1);
                  }}
                >
                  Sonraki
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
