/** Nine-zone pitch grid: A (attacking third) → C (defensive third) for the home team. */
export type PitchZoneDto = 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3';

export const PITCH_ZONES: readonly PitchZoneDto[] = [
  'A1',
  'A2',
  'A3',
  'B1',
  'B2',
  'B3',
  'C1',
  'C2',
  'C3',
] as const;

export interface PitchZonePositionDto {
  readonly leftPercent: number;
  readonly topPercent: number;
}

/** Display coordinates for ball marker on the live pitch (home attacks toward row A). */
export const PITCH_ZONE_POSITIONS: Readonly<Record<PitchZoneDto, PitchZonePositionDto>> = {
  A1: { leftPercent: 18, topPercent: 14 },
  A2: { leftPercent: 50, topPercent: 14 },
  A3: { leftPercent: 82, topPercent: 14 },
  B1: { leftPercent: 18, topPercent: 46 },
  B2: { leftPercent: 50, topPercent: 46 },
  B3: { leftPercent: 82, topPercent: 46 },
  C1: { leftPercent: 18, topPercent: 78 },
  C2: { leftPercent: 50, topPercent: 78 },
  C3: { leftPercent: 82, topPercent: 78 },
};
