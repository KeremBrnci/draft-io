import { Skeleton } from '@/components/admin/skeleton';

export function PageHeaderSkeleton({
  description = true,
}: {
  readonly description?: boolean;
}): React.ReactElement {
  return (
    <header className="admin-page-header admin-page-header--skeleton">
      <Skeleton className="admin-skeleton--title" />
      {description ? <Skeleton className="admin-skeleton--description" /> : null}
    </header>
  );
}

export function FilterRowSkeleton(): React.ReactElement {
  return (
    <div className="admin-card admin-filter-card-skeleton">
      <div className="admin-filter-row">
        <div className="admin-filter-field-skeleton">
          <Skeleton className="admin-skeleton--label" />
          <Skeleton className="admin-skeleton--input" />
        </div>
        <div className="admin-filter-field-skeleton">
          <Skeleton className="admin-skeleton--label" />
          <Skeleton className="admin-skeleton--input" />
        </div>
        <div className="admin-filter-field-skeleton">
          <Skeleton className="admin-skeleton--label" />
          <Skeleton className="admin-skeleton--input" />
        </div>
        <div className="admin-filter-field-skeleton admin-filter-field-skeleton--grow">
          <Skeleton className="admin-skeleton--label" />
          <Skeleton className="admin-skeleton--input" />
        </div>
      </div>
    </div>
  );
}

export function StatCardsSkeleton({ count = 5 }: { readonly count?: number }): React.ReactElement {
  return (
    <div className="admin-card-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="admin-card admin-stat-card admin-stat-card--skeleton">
          <Skeleton className="admin-skeleton--stat-label" />
          <Skeleton className="admin-skeleton--stat-value" />
        </div>
      ))}
    </div>
  );
}

export function DataTableSkeleton({
  columns = 4,
  rows = 10,
  pagination = false,
}: {
  readonly columns?: number;
  readonly rows?: number;
  readonly pagination?: boolean;
}): React.ReactElement {
  return (
    <div className="admin-table-wrap admin-table-wrap--skeleton">
      <table className="admin-table">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index}>
                <Skeleton className="admin-skeleton--th" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="admin-table__skeleton-row">
              {Array.from({ length: columns }).map((__, colIndex) => (
                <td key={colIndex}>
                  <Skeleton
                    className="admin-skeleton--td"
                    tone={colIndex === 0 ? 'strong' : 'default'}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pagination ? (
        <div className="admin-pagination admin-pagination--skeleton">
          <Skeleton className="admin-skeleton--pagination-text" />
          <div className="admin-pagination__actions-skeleton">
            <Skeleton className="admin-skeleton--button" />
            <Skeleton className="admin-skeleton--button" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SectionTitleSkeleton(): React.ReactElement {
  return <Skeleton className="admin-skeleton--section-title" />;
}

export function DashboardPageSkeleton(): React.ReactElement {
  return (
    <>
      <PageHeaderSkeleton />
      <section className="admin-section">
        <SectionTitleSkeleton />
        <div className="admin-quick-links admin-quick-links--skeleton">
          <Skeleton className="admin-skeleton--quick-link" />
          <Skeleton className="admin-skeleton--quick-link" />
        </div>
      </section>
      <section className="admin-section">
        <div className="admin-dashboard-toolbar">
          <SectionTitleSkeleton />
          <Skeleton className="admin-skeleton--button" />
        </div>
        <StatCardsSkeleton count={5} />
      </section>
    </>
  );
}

export function PlayersPageSkeleton(): React.ReactElement {
  return (
    <>
      <PageHeaderSkeleton />
      <FilterRowSkeleton />
      <DataTableSkeleton columns={7} rows={10} pagination />
    </>
  );
}

export function DataQualityPageSkeleton(): React.ReactElement {
  return (
    <>
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={9} />
      <section className="admin-section">
        <SectionTitleSkeleton />
        <DataTableSkeleton columns={2} rows={6} />
      </section>
      <section className="admin-section">
        <SectionTitleSkeleton />
        <DataTableSkeleton columns={2} rows={8} />
      </section>
      <section className="admin-section">
        <SectionTitleSkeleton />
        <DataTableSkeleton columns={2} rows={2} />
      </section>
    </>
  );
}
