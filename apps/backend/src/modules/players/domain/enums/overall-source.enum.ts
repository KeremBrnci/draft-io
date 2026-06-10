/**
 * Tracks how a player's game overall was determined.
 * The game engine owns overall — external API values are never stored as MANUAL or final without calculation.
 */
export enum OverallSource {
  /** Produced by the overall engine (game-owned) */
  CALCULATED = 'CALCULATED',
  /** Admin manually set overall; blocks automatic recalculation until cleared */
  MANUAL_OVERRIDE = 'MANUAL_OVERRIDE',
}

export const ALL_OVERALL_SOURCES: readonly OverallSource[] = [
  OverallSource.CALCULATED,
  OverallSource.MANUAL_OVERRIDE,
] as const;
