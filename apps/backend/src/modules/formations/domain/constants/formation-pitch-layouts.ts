import type { FormationCodeValue } from '../value-objects/formation-code.vo';

interface PitchPoint {
  readonly pitchX: number;
  readonly pitchY: number;
}

/**
 * Explicit pitch coordinates per slot index (1–11), attack at the top.
 * Coordinates use a consistent grid: wings at ~20/80, pivots at ~40/60, center at 50.
 */
const FORMATION_PITCH_LAYOUTS: Record<FormationCodeValue, readonly PitchPoint[]> = {
  '4-4-2': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 20, pitchY: 72 },
    { pitchX: 40, pitchY: 72 },
    { pitchX: 60, pitchY: 72 },
    { pitchX: 80, pitchY: 72 },
    { pitchX: 20, pitchY: 50 },
    { pitchX: 40, pitchY: 50 },
    { pitchX: 60, pitchY: 50 },
    { pitchX: 80, pitchY: 50 },
    { pitchX: 40, pitchY: 16 },
    { pitchX: 60, pitchY: 16 },
  ],
  '4-3-3': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 20, pitchY: 72 },
    { pitchX: 40, pitchY: 72 },
    { pitchX: 60, pitchY: 72 },
    { pitchX: 80, pitchY: 72 },
    { pitchX: 35, pitchY: 52 },
    { pitchX: 50, pitchY: 52 },
    { pitchX: 65, pitchY: 52 },
    { pitchX: 20, pitchY: 30 },
    { pitchX: 50, pitchY: 14 },
    { pitchX: 80, pitchY: 30 },
  ],
  '4-2-3-1': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 20, pitchY: 72 },
    { pitchX: 40, pitchY: 72 },
    { pitchX: 60, pitchY: 72 },
    { pitchX: 80, pitchY: 72 },
    { pitchX: 40, pitchY: 58 },
    { pitchX: 60, pitchY: 58 },
    { pitchX: 50, pitchY: 36 },
    { pitchX: 20, pitchY: 36 },
    { pitchX: 50, pitchY: 14 },
    { pitchX: 80, pitchY: 36 },
  ],
  '3-5-2': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 30, pitchY: 72 },
    { pitchX: 50, pitchY: 72 },
    { pitchX: 70, pitchY: 72 },
    { pitchX: 18, pitchY: 50 },
    { pitchX: 38, pitchY: 50 },
    { pitchX: 50, pitchY: 50 },
    { pitchX: 62, pitchY: 50 },
    { pitchX: 82, pitchY: 50 },
    { pitchX: 40, pitchY: 16 },
    { pitchX: 60, pitchY: 16 },
  ],
  '5-3-2': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 18, pitchY: 72 },
    { pitchX: 35, pitchY: 72 },
    { pitchX: 50, pitchY: 72 },
    { pitchX: 65, pitchY: 72 },
    { pitchX: 82, pitchY: 72 },
    { pitchX: 35, pitchY: 50 },
    { pitchX: 50, pitchY: 50 },
    { pitchX: 65, pitchY: 50 },
    { pitchX: 40, pitchY: 16 },
    { pitchX: 60, pitchY: 16 },
  ],
  '3-4-3': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 30, pitchY: 72 },
    { pitchX: 50, pitchY: 72 },
    { pitchX: 70, pitchY: 72 },
    { pitchX: 20, pitchY: 50 },
    { pitchX: 40, pitchY: 50 },
    { pitchX: 60, pitchY: 50 },
    { pitchX: 80, pitchY: 50 },
    { pitchX: 20, pitchY: 30 },
    { pitchX: 50, pitchY: 14 },
    { pitchX: 80, pitchY: 30 },
  ],
  '4-5-1': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 20, pitchY: 72 },
    { pitchX: 40, pitchY: 72 },
    { pitchX: 60, pitchY: 72 },
    { pitchX: 80, pitchY: 72 },
    { pitchX: 50, pitchY: 60 },
    { pitchX: 20, pitchY: 44 },
    { pitchX: 40, pitchY: 48 },
    { pitchX: 80, pitchY: 44 },
    { pitchX: 50, pitchY: 34 },
    { pitchX: 50, pitchY: 14 },
  ],
  '4-2-2-2': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 20, pitchY: 72 },
    { pitchX: 40, pitchY: 72 },
    { pitchX: 60, pitchY: 72 },
    { pitchX: 80, pitchY: 72 },
    { pitchX: 40, pitchY: 60 },
    { pitchX: 60, pitchY: 60 },
    { pitchX: 40, pitchY: 38 },
    { pitchX: 60, pitchY: 38 },
    { pitchX: 40, pitchY: 16 },
    { pitchX: 60, pitchY: 16 },
  ],
  '4-1-2-1-2': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 20, pitchY: 72 },
    { pitchX: 40, pitchY: 72 },
    { pitchX: 60, pitchY: 72 },
    { pitchX: 80, pitchY: 72 },
    { pitchX: 50, pitchY: 62 },
    { pitchX: 35, pitchY: 48 },
    { pitchX: 65, pitchY: 48 },
    { pitchX: 50, pitchY: 32 },
    { pitchX: 35, pitchY: 14 },
    { pitchX: 65, pitchY: 14 },
  ],
};

export function getFormationPitchLayout(code: string): readonly PitchPoint[] | null {
  if (!(code in FORMATION_PITCH_LAYOUTS)) {
    return null;
  }

  return FORMATION_PITCH_LAYOUTS[code as FormationCodeValue];
}
