const STATUS_CLASS: Record<string, string> = {
  COMPLETED: 'admin-badge--completed',
  RUNNING: 'admin-badge--running',
  PENDING: 'admin-badge--pending',
  FAILED: 'admin-badge--failed',
  PARTIAL: 'admin-badge--partial',
};

export function StatusBadge({ status }: { readonly status: string }): React.ReactElement {
  const variant = STATUS_CLASS[status] ?? 'admin-badge--pending';

  return <span className={`admin-badge ${variant}`}>{status}</span>;
}
