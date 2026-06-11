export type PickBoardProfile = 'ELITE' | 'COMPACT' | 'SPREAD' | 'VALUE';

export const PICK_BOARD_ELITE_RATE = 0.15;
export const PICK_BOARD_COMPACT_RATE = 0.3;
export const PICK_BOARD_SPREAD_RATE = 0.35;

export const PICK_BOARD_OVERALL_FLOOR = 75;

/** Last-resort overall floor when strict filters would return no options. */
export const PICK_BOARD_RELAXED_OVERALL_FLOOR = 72;

/** Position-specific relaxed floors (e.g. thin GK pool at 80+). */
export const PICK_BOARD_RELAXED_POSITION_FLOORS: Readonly<Partial<Record<string, number>>> = {
  GK: PICK_BOARD_RELAXED_OVERALL_FLOOR,
};

export function pickBoardOverallFloor(positionCode: string, relaxed = false): number {
  if (!relaxed) {
    return PICK_BOARD_OVERALL_FLOOR;
  }

  return (
    PICK_BOARD_RELAXED_POSITION_FLOORS[positionCode.toUpperCase()] ??
    PICK_BOARD_RELAXED_OVERALL_FLOOR
  );
}

export const RECENTLY_OFFERED_PLAYER_LIMIT = 30;
export const RECENTLY_OFFERED_WEIGHT_MULTIPLIER = 0.08;

export const PICK_BOARD_WINDOWS: Record<
  PickBoardProfile,
  { readonly minOverall: number; readonly maxOverall: number | null }
> = {
  ELITE: { minOverall: 86, maxOverall: null },
  COMPACT: { minOverall: 82, maxOverall: 87 },
  SPREAD: { minOverall: 78, maxOverall: 90 },
  VALUE: { minOverall: 75, maxOverall: 82 },
};
