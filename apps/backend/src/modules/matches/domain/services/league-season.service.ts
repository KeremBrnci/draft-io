export function isLeagueSeasonComplete(fixtureCount: number, completedMatchCount: number): boolean {
  return fixtureCount > 0 && completedMatchCount >= fixtureCount;
}
