export interface TargetCompetitionSeed {
  readonly externalId: string;
  readonly slug: string;
  readonly name: string;
  readonly countryExternalId: string;
  readonly countryName: string;
  readonly tier: 1 | 2;
}

/**
 * Curated top-tier competitions for initial database population.
 * External IDs are Transfermarkt competition codes.
 */
export const TARGET_COMPETITIONS: readonly TargetCompetitionSeed[] = [
  {
    externalId: 'GB1',
    slug: 'premier-league',
    name: 'Premier League',
    countryExternalId: '189',
    countryName: 'England',
    tier: 1,
  },
  {
    externalId: 'ES1',
    slug: 'laliga',
    name: 'LaLiga',
    countryExternalId: '157',
    countryName: 'Spain',
    tier: 1,
  },
  {
    externalId: 'L1',
    slug: 'bundesliga',
    name: 'Bundesliga',
    countryExternalId: '40',
    countryName: 'Germany',
    tier: 1,
  },
  {
    externalId: 'IT1',
    slug: 'serie-a',
    name: 'Serie A',
    countryExternalId: '75',
    countryName: 'Italy',
    tier: 1,
  },
  {
    externalId: 'FR1',
    slug: 'ligue-1',
    name: 'Ligue 1',
    countryExternalId: '50',
    countryName: 'France',
    tier: 1,
  },
  {
    externalId: 'TR1',
    slug: 'super-lig',
    name: 'Süper Lig',
    countryExternalId: '174',
    countryName: 'Turkey',
    tier: 2,
  },
  {
    externalId: 'NL1',
    slug: 'eredivisie',
    name: 'Eredivisie',
    countryExternalId: '122',
    countryName: 'Netherlands',
    tier: 2,
  },
  {
    externalId: 'PO1',
    slug: 'liga-portugal',
    name: 'Liga Portugal',
    countryExternalId: '136',
    countryName: 'Portugal',
    tier: 2,
  },
] as const;

export function findTargetCompetitionByExternalId(
  externalId: string,
): TargetCompetitionSeed | undefined {
  return TARGET_COMPETITIONS.find((competition) => competition.externalId === externalId);
}
