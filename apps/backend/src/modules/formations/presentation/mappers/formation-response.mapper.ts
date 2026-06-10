import type { Formation } from '../../domain/entities/formation.entity';
import { computePitchCoordinates } from '../../domain/services/formation-pitch-layout.service';

export interface FormationSlotResponse {
  readonly index: number;
  readonly label: string;
  readonly allowedPositions: readonly string[];
  readonly pitchX: number;
  readonly pitchY: number;
}

export interface FormationSummaryResponse {
  readonly id: string;
  readonly code: string;
  readonly slots: readonly FormationSlotResponse[];
}

export function toFormationSummary(formation: Formation): FormationSummaryResponse {
  return {
    id: formation.id,
    code: formation.code.value,
    slots: formation.slots.map((slot) => {
      const coordinates = computePitchCoordinates(formation.code.value, slot.index, slot.label);
      return {
        index: slot.index,
        label: slot.label,
        allowedPositions: [...slot.allowedPositions],
        pitchX: coordinates.pitchX,
        pitchY: coordinates.pitchY,
      };
    }),
  };
}

export function toFormationSummaryList(
  formations: readonly Formation[],
): readonly FormationSummaryResponse[] {
  return formations.map((formation) => toFormationSummary(formation));
}
