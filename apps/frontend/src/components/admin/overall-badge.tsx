interface OverallBadgeProps {
  readonly overall: number | null | undefined;
}

export function OverallBadge({ overall }: OverallBadgeProps): React.ReactElement {
  if (overall === null || overall === undefined) {
    return <span className="admin-overall-badge admin-overall-badge--empty">—</span>;
  }

  const tier =
    overall >= 90 ? 'elite' : overall >= 85 ? 'high' : overall >= 80 ? 'good' : 'base';

  return (
    <span className={`admin-overall-badge admin-overall-badge--${tier}`}>{overall}</span>
  );
}
