import { OverallProfileTag } from '../enums/overall-profile-tag.enum';

/**
 * Curated elite veterans whose Transfermarkt market value understates FIFA-style reputation.
 * Keyed by Transfermarkt player external id.
 */
export interface LegendPlayerProfile {
  readonly externalId: string;
  readonly profileTag: OverallProfileTag;
  readonly careerScore: number;
  readonly legacyScore: number;
}

export const LEGEND_PLAYER_PROFILES: readonly LegendPlayerProfile[] = [
  {
    externalId: '225083',
    profileTag: OverallProfileTag.LEGEND_ACTIVE_OLD,
    careerScore: 94,
    legacyScore: 92,
  },
  {
    externalId: '27992',
    profileTag: OverallProfileTag.LEGEND_ACTIVE_OLD,
    careerScore: 98,
    legacyScore: 96,
  },
  {
    externalId: '42460',
    profileTag: OverallProfileTag.LEGEND_ACTIVE_OLD,
    careerScore: 90,
    legacyScore: 88,
  },
  {
    externalId: '61651',
    profileTag: OverallProfileTag.LEGEND_ACTIVE_OLD,
    careerScore: 88,
    legacyScore: 85,
  },
  {
    externalId: '38253',
    profileTag: OverallProfileTag.LEGEND_ACTIVE_OLD,
    careerScore: 96,
    legacyScore: 92,
  },
  {
    externalId: '16306',
    profileTag: OverallProfileTag.LEGEND_ACTIVE_OLD,
    careerScore: 92,
    legacyScore: 88,
  },
  {
    externalId: '125781',
    profileTag: OverallProfileTag.LEGEND_ACTIVE_OLD,
    careerScore: 91,
    legacyScore: 87,
  },
  {
    externalId: '424784',
    profileTag: OverallProfileTag.LEGEND_ACTIVE_OLD,
    careerScore: 93,
    legacyScore: 90,
  },
  {
    externalId: '74842',
    profileTag: OverallProfileTag.LEGEND_ACTIVE_OLD,
    careerScore: 85,
    legacyScore: 82,
  },
  {
    externalId: '88755',
    profileTag: OverallProfileTag.ELITE_CURRENT,
    careerScore: 94,
    legacyScore: 85,
  },
] as const;

const LEGEND_PROFILE_BY_EXTERNAL_ID = new Map<string, LegendPlayerProfile>(
  LEGEND_PLAYER_PROFILES.map((profile) => [profile.externalId, profile]),
);

export function findLegendPlayerProfile(
  externalId: string | null | undefined,
): LegendPlayerProfile | null {
  if (externalId === null || externalId === undefined || externalId.trim().length === 0) {
    return null;
  }

  return LEGEND_PROFILE_BY_EXTERNAL_ID.get(externalId.trim()) ?? null;
}
