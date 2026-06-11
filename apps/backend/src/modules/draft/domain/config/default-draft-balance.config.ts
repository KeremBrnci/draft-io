import type {
  ChemistryConfigDto,
  DraftBalanceConfigDto,
  DraftTierCodeDto,
  MatchPowerConfigDto,
  PositionWeightConfigDto,
} from '@draft-io/shared-types';

export type DraftTierConfig = DraftBalanceConfigDto['tiers'][number];
export type ChemistryConfig = ChemistryConfigDto;
export type MatchPowerConfig = MatchPowerConfigDto;
export type PositionWeightConfig = PositionWeightConfigDto;

export const DEFAULT_DRAFT_TIERS: readonly DraftTierConfig[] = [
  { code: 'S', minOverall: 92, maxOverall: null },
  { code: 'A', minOverall: 88, maxOverall: 91 },
  { code: 'B', minOverall: 84, maxOverall: 87 },
  { code: 'C', minOverall: 80, maxOverall: 83 },
  { code: 'D', minOverall: 75, maxOverall: 79 },
] as const;

export const DEFAULT_CHEMISTRY_CONFIG: ChemistryConfig = {
  sameClubBonus: 2,
  sameNationBonus: 1,
  sameLeagueBonus: 1,
  maxChemistryPerPlayer: 3,
  maxTeamChemistry: 33,
};

export const DEFAULT_MATCH_POWER_CONFIG: MatchPowerConfig = {
  chemistryMaxBoostPercent: 8,
  chemistryScaleMax: 33,
  minMultiplier: 1.0,
  maxMultiplier: 1.1,
};

export const DEFAULT_POSITION_WEIGHTS: PositionWeightConfig = {
  primary: 1.0,
  secondary: 0.9,
  tertiary: 0.8,
};

export const DEFAULT_DRAFT_BALANCE_CONFIG: DraftBalanceConfigDto = {
  tiers: DEFAULT_DRAFT_TIERS,
  targetTeamAverageOverall: 87,
  rosterSize: 11,
  finalOverallSpreadMax: 3,
  candidatesPerPick: 5,
  wildcardProbability: 0.1,
  eliteTierCodes: ['S', 'A'] satisfies readonly DraftTierCodeDto[],
  chemistry: DEFAULT_CHEMISTRY_CONFIG,
  matchPower: DEFAULT_MATCH_POWER_CONFIG,
  positionWeights: DEFAULT_POSITION_WEIGHTS,
};
