/** Builds a short league label for the card metadata row (no copyrighted logos). */
export function formatLeagueIndicator(leagueName: string | null): string | null {
  if (leagueName === null || leagueName.trim().length === 0) {
    return null;
  }

  const trimmed = leagueName.trim();

  const knownAbbreviations: Readonly<Record<string, string>> = {
    'Premier League': 'PL',
    'LaLiga': 'LL',
    'La Liga': 'LL',
    'Serie A': 'SA',
    'Bundesliga': 'BL',
    'Ligue 1': 'L1',
    'Süper Lig': 'SL',
    'Super Lig': 'SL',
    'Primeira Liga': 'PL',
    'Eredivisie': 'ED',
    'Major League Soccer': 'MLS',
    'Championship': 'CH',
  };

  const known = knownAbbreviations[trimmed];
  if (known !== undefined) {
    return known;
  }

  const words = trimmed.split(/\s+/).filter((word) => word.length > 0);

  if (words.length === 1) {
    const single = words[0];
    return single === undefined ? null : single.slice(0, 3).toUpperCase();
  }

  return words
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}
