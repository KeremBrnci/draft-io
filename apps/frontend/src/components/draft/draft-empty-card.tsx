import './draft.css';

interface DraftEmptyCardProps {
  readonly label: string;
  readonly active?: boolean;
  readonly locked?: boolean;
  readonly onClick?: () => void;
}

export function DraftEmptyCard({
  label,
  active = false,
  locked = false,
  onClick,
}: DraftEmptyCardProps): React.ReactElement {
  const className = [
    'draft-empty-card',
    active ? 'draft-empty-card--active' : '',
    locked ? 'draft-empty-card--locked' : '',
    onClick !== undefined ? 'draft-empty-card--clickable' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (onClick !== undefined) {
    return (
      <button
        type="button"
        className={className}
        onClick={onClick}
        aria-label={`${label} mevkisi — oyuncu seç`}
      >
        <span className="draft-empty-card__label">{label}</span>
        <span className="draft-empty-card__hint">Seç</span>
      </button>
    );
  }

  return (
    <div className={className} aria-label={`${label} mevkisi — boş`}>
      <span className="draft-empty-card__label">{label}</span>
    </div>
  );
}
