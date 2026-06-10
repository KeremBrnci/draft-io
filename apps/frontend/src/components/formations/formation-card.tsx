import type { FormationSummaryDto } from '@draft-io/shared-types';

import { FormationPitch } from './formation-pitch';

interface FormationCardProps {
  readonly formation: FormationSummaryDto;
  readonly selected: boolean;
  readonly locked: boolean;
  readonly disabled: boolean;
  readonly onSelect: () => void;
}

export function FormationCard({
  formation,
  selected,
  locked,
  disabled,
  onSelect,
}: FormationCardProps): React.ReactElement {
  const stateClass = selected
    ? locked
      ? ' formation-card--locked'
      : ' formation-card--selected'
    : '';

  return (
    <button
      type="button"
      className={`formation-card${stateClass}`}
      disabled={disabled || locked}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="formation-card__header">
        <strong>{formation.code}</strong>
        {locked ? <span className="formation-card__badge">Kilitli</span> : null}
        {selected && !locked ? <span className="formation-card__badge">Seçildi</span> : null}
      </div>
      <FormationPitch code={formation.code} slots={formation.slots} compact />
    </button>
  );
}
