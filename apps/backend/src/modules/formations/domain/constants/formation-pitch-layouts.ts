import type { FormationCodeValue } from '../value-objects/formation-code.vo';

interface PitchPoint {
  readonly pitchX: number;
  readonly pitchY: number;
}

/**
 * Explicit pitch coordinates per slot index (1–11), attack at the top.
 * Layouts follow standard tactical diagrams: wings near the touchline,
 * pivots narrower, lone striker highest.
 */
const FORMATION_PITCH_LAYOUTS: Record<FormationCodeValue, readonly PitchPoint[]> = {
  '4-4-2': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 12, pitchY: 70 },
    { pitchX: 36, pitchY: 70 },
    { pitchX: 64, pitchY: 70 },
    { pitchX: 88, pitchY: 70 },
    { pitchX: 12, pitchY: 48 },
    { pitchX: 40, pitchY: 48 },
    { pitchX: 60, pitchY: 48 },
    { pitchX: 88, pitchY: 48 },
    { pitchX: 38, pitchY: 14 },
    { pitchX: 62, pitchY: 14 },
  ],
  '4-3-3': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 12, pitchY: 70 },
    { pitchX: 36, pitchY: 70 },
    { pitchX: 64, pitchY: 70 },
    { pitchX: 88, pitchY: 70 },
    { pitchX: 32, pitchY: 50 },
    { pitchX: 50, pitchY: 50 },
    { pitchX: 68, pitchY: 50 },
    { pitchX: 12, pitchY: 28 },
    { pitchX: 50, pitchY: 12 },
    { pitchX: 88, pitchY: 28 },
  ],
  '4-2-3-1': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 12, pitchY: 70 },
    { pitchX: 36, pitchY: 70 },
    { pitchX: 64, pitchY: 70 },
    { pitchX: 88, pitchY: 70 },
    { pitchX: 38, pitchY: 54 },
    { pitchX: 62, pitchY: 54 },
    { pitchX: 50, pitchY: 36 },
    { pitchX: 12, pitchY: 36 },
    { pitchX: 50, pitchY: 12 },
    { pitchX: 88, pitchY: 36 },
  ],
  '3-5-2': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 28, pitchY: 70 },
    { pitchX: 50, pitchY: 70 },
    { pitchX: 72, pitchY: 70 },
    { pitchX: 10, pitchY: 50 },
    { pitchX: 35, pitchY: 48 },
    { pitchX: 50, pitchY: 48 },
    { pitchX: 65, pitchY: 48 },
    { pitchX: 90, pitchY: 50 },
    { pitchX: 38, pitchY: 14 },
    { pitchX: 62, pitchY: 14 },
  ],
  '5-3-2': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 10, pitchY: 66 },
    { pitchX: 28, pitchY: 70 },
    { pitchX: 50, pitchY: 70 },
    { pitchX: 72, pitchY: 70 },
    { pitchX: 90, pitchY: 66 },
    { pitchX: 32, pitchY: 50 },
    { pitchX: 50, pitchY: 50 },
    { pitchX: 68, pitchY: 50 },
    { pitchX: 38, pitchY: 14 },
    { pitchX: 62, pitchY: 14 },
  ],
  '3-4-3': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 28, pitchY: 70 },
    { pitchX: 50, pitchY: 70 },
    { pitchX: 72, pitchY: 70 },
    { pitchX: 12, pitchY: 48 },
    { pitchX: 38, pitchY: 48 },
    { pitchX: 62, pitchY: 48 },
    { pitchX: 88, pitchY: 48 },
    { pitchX: 12, pitchY: 28 },
    { pitchX: 50, pitchY: 12 },
    { pitchX: 88, pitchY: 28 },
  ],
  '4-5-1': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 12, pitchY: 70 },
    { pitchX: 36, pitchY: 70 },
    { pitchX: 64, pitchY: 70 },
    { pitchX: 88, pitchY: 70 },
    { pitchX: 50, pitchY: 58 },
    { pitchX: 12, pitchY: 44 },
    { pitchX: 38, pitchY: 48 },
    { pitchX: 88, pitchY: 44 },
    { pitchX: 50, pitchY: 34 },
    { pitchX: 50, pitchY: 12 },
  ],
  '4-2-2-2': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 12, pitchY: 70 },
    { pitchX: 36, pitchY: 70 },
    { pitchX: 64, pitchY: 70 },
    { pitchX: 88, pitchY: 70 },
    { pitchX: 38, pitchY: 54 },
    { pitchX: 62, pitchY: 54 },
    { pitchX: 38, pitchY: 36 },
    { pitchX: 62, pitchY: 36 },
    { pitchX: 38, pitchY: 14 },
    { pitchX: 62, pitchY: 14 },
  ],
  '4-1-2-1-2': [
    { pitchX: 50, pitchY: 90 },
    { pitchX: 12, pitchY: 70 },
    { pitchX: 36, pitchY: 70 },
    { pitchX: 64, pitchY: 70 },
    { pitchX: 88, pitchY: 70 },
    { pitchX: 50, pitchY: 56 },
    { pitchX: 38, pitchY: 46 },
    { pitchX: 62, pitchY: 46 },
    { pitchX: 50, pitchY: 34 },
    { pitchX: 38, pitchY: 14 },
    { pitchX: 62, pitchY: 14 },
  ],
};

export function getFormationPitchLayout(code: string): readonly PitchPoint[] | null {
  if (!(code in FORMATION_PITCH_LAYOUTS)) {
    return null;
  }

  return FORMATION_PITCH_LAYOUTS[code as FormationCodeValue];
}
