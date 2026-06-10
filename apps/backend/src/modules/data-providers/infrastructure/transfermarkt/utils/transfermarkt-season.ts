/**
 * Transfermarkt season ids use the starting year of the football season (e.g. 2025 for 2025/26).
 * European seasons typically roll over in July.
 */
export function resolveTransfermarktSeasonId(referenceDate: Date = new Date()): string {
  const year = referenceDate.getUTCFullYear();
  const month = referenceDate.getUTCMonth() + 1;

  return month >= 7 ? String(year) : String(year - 1);
}

export function buildTransfermarktSeasonQuery(seasonId: string): string {
  return `season_id=${encodeURIComponent(seasonId)}`;
}

/** Candidate season ids for competition/club-list endpoints (newest first). */
export function resolveTransfermarktCompetitionSeasonCandidates(
  configuredSeasonId?: string,
  referenceDate: Date = new Date(),
): readonly string[] {
  const primary = configuredSeasonId ?? resolveTransfermarktSeasonId(referenceDate);
  const previous = String(Number(primary) - 1);

  return primary === previous ? [primary] : [primary, previous];
}
