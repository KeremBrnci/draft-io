export type PickBoardProfile = 'ELITE' | 'COMPACT' | 'SPREAD';

export const PICK_BOARD_ELITE_RATE = 0.2;
export const PICK_BOARD_COMPACT_RATE = 0.35;

export const PICK_BOARD_OVERALL_FLOOR = 80;
export const RECENTLY_OFFERED_PLAYER_LIMIT = 30;
export const RECENTLY_OFFERED_WEIGHT_MULTIPLIER = 0.08;

export const PICK_BOARD_WINDOWS: Record<
  PickBoardProfile,
  { readonly minOverall: number; readonly maxOverall: number | null }
> = {
  ELITE: { minOverall: 85, maxOverall: null },
  COMPACT: { minOverall: 82, maxOverall: 87 },
  SPREAD: { minOverall: 80, maxOverall: 92 },
};
