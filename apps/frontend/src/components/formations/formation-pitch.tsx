import type { FormationSlotDto } from '@draft-io/shared-types';

interface FormationPitchProps {
  readonly code: string;
  readonly slots: readonly FormationSlotDto[];
  readonly compact?: boolean;
}

export function FormationPitch({ code, slots, compact = false }: FormationPitchProps): React.ReactElement {
  return (
    <div className={`formation-pitch${compact ? ' formation-pitch--compact' : ''}`} aria-label={`${code} pitch preview`}>
      <div className="formation-pitch__grass" />
      <div className="formation-pitch__line formation-pitch__line--half" />
      <div className="formation-pitch__line formation-pitch__line--box" />
      {slots.map((slot) => (
        <span
          key={`${code}-${slot.index}`}
          className="formation-pitch__marker"
          style={{ left: `${slot.pitchX}%`, top: `${slot.pitchY}%` }}
          title={slot.label}
        >
          {slot.label}
        </span>
      ))}
    </div>
  );
}
