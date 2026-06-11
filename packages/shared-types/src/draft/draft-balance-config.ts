export type DraftTierCodeDto = 'S' | 'A' | 'B' | 'C' | 'D';

export interface DraftTierConfigDto {
  readonly code: DraftTierCodeDto;
  readonly minOverall: number;
  readonly maxOverall: number | null;
}

export interface ChemistryConfigDto {
  readonly sameClubBonus: number;
  readonly sameNationBonus: number;
  readonly sameLeagueBonus: number;
  readonly maxChemistryPerPlayer: number;
  readonly maxTeamChemistry: number;
}

export interface MatchPowerConfigDto {
  readonly chemistryMaxBoostPercent: number;
  readonly chemistryScaleMax: number;
  readonly minMultiplier: number;
  readonly maxMultiplier: number;
}

export interface PositionWeightConfigDto {
  readonly primary: number;
  readonly secondary: number;
  readonly tertiary: number;
}

export interface DraftBalanceConfigDto {
  readonly tiers: readonly DraftTierConfigDto[];
  readonly targetTeamAverageOverall: number;
  readonly rosterSize: number;
  readonly finalOverallSpreadMax: number;
  readonly candidatesPerPick: number;
  readonly wildcardProbability: number;
  readonly eliteTierCodes: readonly DraftTierCodeDto[];
  readonly chemistry: ChemistryConfigDto;
  readonly matchPower: MatchPowerConfigDto;
  readonly positionWeights: PositionWeightConfigDto;
}
