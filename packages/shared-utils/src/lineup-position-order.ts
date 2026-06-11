/** Display order for match lineups — attackers first, goalkeeper last. */
const LINEUP_POSITION_ORDER: Readonly<Record<string, number>> = {
  ST: 0,
  CF: 1,
  SS: 2,
  LW: 3,
  RW: 4,
  LM: 10,
  RM: 11,
  CAM: 12,
  CM: 13,
  CDM: 14,
  LB: 20,
  CB: 21,
  RB: 22,
  GK: 99,
};

export function lineupPositionRank(positionCode: string): number {
  return LINEUP_POSITION_ORDER[positionCode.toUpperCase()] ?? 50;
}

export function sortLineupPlayersByPosition<T extends { readonly positionCode: string }>(
  players: readonly T[],
): T[] {
  return [...players].sort(
    (left, right) => lineupPositionRank(left.positionCode) - lineupPositionRank(right.positionCode),
  );
}
