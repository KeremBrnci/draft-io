export type PickBoardProfile = 'ELITE' | 'COMPACT' | 'SPREAD' | 'VALUE';

export const PICK_BOARD_ELITE_RATE = 0.15;
export const PICK_BOARD_COMPACT_RATE = 0.3;
export const PICK_BOARD_SPREAD_RATE = 0.35;

export const PICK_BOARD_OVERALL_FLOOR = 75;

/** Last-resort overall floor when strict filters would return no options. */
export const PICK_BOARD_RELAXED_OVERALL_FLOOR = 72;

/** Emergency floor — used when a position/league slice is still too thin. */
export const PICK_BOARD_EMERGENCY_OVERALL_FLOOR = 58;

/** Position-specific strict floors (GK pools are much smaller per league). */
export const PICK_BOARD_POSITION_FLOORS: Readonly<Partial<Record<string, number>>> = {
  GK: 72,
};

/** Position-specific relaxed floors (e.g. thin GK pool in single-league lobbies). */
export const PICK_BOARD_RELAXED_POSITION_FLOORS: Readonly<Partial<Record<string, number>>> = {
  GK: 66,
};

export function pickBoardOverallFloor(
  positionCode: string,
  mode: 'strict' | 'relaxed' | 'emergency' = 'strict',
): number {
  const normalized = positionCode.toUpperCase();

  if (mode === 'emergency') {
    return PICK_BOARD_EMERGENCY_OVERALL_FLOOR;
  }

  if (mode === 'relaxed') {
    return PICK_BOARD_RELAXED_POSITION_FLOORS[normalized] ?? PICK_BOARD_RELAXED_OVERALL_FLOOR;
  }

  return PICK_BOARD_POSITION_FLOORS[normalized] ?? PICK_BOARD_OVERALL_FLOOR;
}

const GK_PICK_BOARD_WINDOWS: Record<
  PickBoardProfile,
  { readonly minOverall: number; readonly maxOverall: number | null }
> = {
  ELITE: { minOverall: 78, maxOverall: null },
  COMPACT: { minOverall: 74, maxOverall: 82 },
  SPREAD: { minOverall: 70, maxOverall: 84 },
  VALUE: { minOverall: 64, maxOverall: 78 },
};

export function resolvePickBoardWindow(
  profile: PickBoardProfile,
  positionCode: string,
): { readonly minOverall: number; readonly maxOverall: number | null } {
  if (positionCode.toUpperCase() === 'GK') {
    return GK_PICK_BOARD_WINDOWS[profile];
  }

  return PICK_BOARD_WINDOWS[profile];
}

export const RECENTLY_OFFERED_PLAYER_LIMIT = 45;
export const RECENTLY_OFFERED_WEIGHT_MULTIPLIER = 0.14;

export const PICK_BOARD_WINDOWS: Record<
  PickBoardProfile,
  { readonly minOverall: number; readonly maxOverall: number | null }
> = {
  ELITE: { minOverall: 86, maxOverall: null },
  COMPACT: { minOverall: 82, maxOverall: 87 },
  SPREAD: { minOverall: 78, maxOverall: 90 },
  VALUE: { minOverall: 75, maxOverall: 82 },
};
