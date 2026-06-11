/** Default eligible cards loaded per pick. */
export const DRAFT_PICK_POOL_FETCH_LIMIT = 256;

/** League-scoped pools are smaller — fetch more to keep rare positions viable. */
export const DRAFT_PICK_POOL_LEAGUE_FETCH_LIMIT = 512;

/** Goalkeepers are thin in single-league filters — pull a wider slice. */
export const DRAFT_PICK_POOL_GK_FETCH_LIMIT = 640;

export function resolveDraftPoolFetchLimit(input: {
  readonly positionCode: string;
  readonly leagueIds?: readonly string[];
}): number {
  const hasLeagueFilter = (input.leagueIds?.length ?? 0) > 0;

  if (input.positionCode.toUpperCase() === 'GK') {
    return hasLeagueFilter ? DRAFT_PICK_POOL_GK_FETCH_LIMIT : 384;
  }

  return hasLeagueFilter ? DRAFT_PICK_POOL_LEAGUE_FETCH_LIMIT : DRAFT_PICK_POOL_FETCH_LIMIT;
}
