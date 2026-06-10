import { OverallProfileTag } from '../enums/overall-profile-tag.enum';

export interface ScoreBracket {
  readonly minValue: number;
  readonly score: number;
}

export interface OverallV1Weights {
  readonly marketValue: number;
  readonly career: number;
  readonly age: number;
  readonly league: number;
  readonly legacy: number;
}

export interface OverallV1Calibration {
  readonly intercept: number;
  readonly slope: number;
}

export interface OverallProfileBounds {
  readonly floor?: number;
  readonly ceiling?: number;
}

export const OVERALL_V1_WEIGHTS: OverallV1Weights = {
  marketValue: 0.35,
  career: 0.25,
  age: 0.2,
  league: 0.15,
  legacy: 0.05,
};

export const OVERALL_V1_CALIBRATION: OverallV1Calibration = {
  intercept: 30,
  slope: 0.66,
};

/** Market value (EUR) → 0–100 score brackets */
export const MARKET_VALUE_BRACKETS: readonly ScoreBracket[] = [
  { minValue: 0, score: 38 },
  { minValue: 500_000, score: 48 },
  { minValue: 1_000_000, score: 55 },
  { minValue: 5_000_000, score: 63 },
  { minValue: 10_000_000, score: 69 },
  { minValue: 20_000_000, score: 75 },
  { minValue: 40_000_000, score: 81 },
  { minValue: 60_000_000, score: 85 },
  { minValue: 80_000_000, score: 88 },
  { minValue: 100_000_000, score: 91 },
  { minValue: 120_000_000, score: 93 },
  { minValue: 150_000_000, score: 95 },
  { minValue: 180_000_000, score: 96 },
  { minValue: 200_000_000, score: 97 },
];

/**
 * Inferred career score from market value when no manual career data exists.
 * Replaced by trophy collection in a future sprint.
 */
/** Career proxy from market value — tracks FIFA-style reputation until trophy data ships. */
export const INFERRED_CAREER_BRACKETS: readonly ScoreBracket[] = [
  { minValue: 0, score: 50 },
  { minValue: 5_000_000, score: 58 },
  { minValue: 10_000_000, score: 64 },
  { minValue: 20_000_000, score: 72 },
  { minValue: 40_000_000, score: 78 },
  { minValue: 60_000_000, score: 83 },
  { minValue: 80_000_000, score: 87 },
  { minValue: 100_000_000, score: 90 },
  { minValue: 150_000_000, score: 93 },
  { minValue: 180_000_000, score: 95 },
  { minValue: 200_000_000, score: 96 },
];

/** Reputation / legacy proxy from market value and veteran status. */
export const INFERRED_LEGACY_BRACKETS: readonly ScoreBracket[] = [
  { minValue: 0, score: 0 },
  { minValue: 5_000_000, score: 22 },
  { minValue: 10_000_000, score: 32 },
  { minValue: 20_000_000, score: 44 },
  { minValue: 40_000_000, score: 54 },
  { minValue: 60_000_000, score: 62 },
  { minValue: 80_000_000, score: 70 },
  { minValue: 100_000_000, score: 76 },
  { minValue: 150_000_000, score: 82 },
  { minValue: 180_000_000, score: 86 },
  { minValue: 200_000_000, score: 88 },
];

export interface VeteranLegacyBonusTier {
  readonly minAge: number;
  readonly minMarketValue: number;
  readonly bonus: number;
}

export const VETERAN_LEGACY_BONUS: readonly VeteranLegacyBonusTier[] = [
  { minAge: 28, minMarketValue: 15_000_000, bonus: 8 },
  { minAge: 30, minMarketValue: 12_000_000, bonus: 14 },
  { minAge: 32, minMarketValue: 10_000_000, bonus: 20 },
  { minAge: 34, minMarketValue: 8_000_000, bonus: 25 },
];

/** Stars in weaker leagues keep a league-score floor derived from market value. */
export const STAR_LEAGUE_FLOOR_BRACKETS: readonly ScoreBracket[] = [
  { minValue: 20_000_000, score: 84 },
  { minValue: 40_000_000, score: 86 },
  { minValue: 60_000_000, score: 88 },
  { minValue: 80_000_000, score: 90 },
];

export interface MarketValueOverallFloor {
  readonly minValue: number;
  readonly floor: number;
}

/** FIFA-style minimum overall for proven market-value tiers. */
export const MARKET_VALUE_OVERALL_FLOORS: readonly MarketValueOverallFloor[] = [
  { minValue: 15_000_000, floor: 75 },
  { minValue: 25_000_000, floor: 77 },
  { minValue: 35_000_000, floor: 79 },
  { minValue: 50_000_000, floor: 81 },
  { minValue: 60_000_000, floor: 83 },
  { minValue: 75_000_000, floor: 85 },
  { minValue: 100_000_000, floor: 86 },
  { minValue: 120_000_000, floor: 87 },
  { minValue: 150_000_000, floor: 88 },
  { minValue: 180_000_000, floor: 89 },
  { minValue: 200_000_000, floor: 90 },
];

/** Prevent market-value inflation from overshooting FIFA-like elite bands. */
export const MARKET_VALUE_OVERALL_CEILINGS: readonly MarketValueOverallFloor[] = [
  { minValue: 100_000_000, floor: 88 },
  { minValue: 120_000_000, floor: 89 },
  { minValue: 150_000_000, floor: 90 },
  { minValue: 180_000_000, floor: 91 },
  { minValue: 200_000_000, floor: 92 },
];

export const YOUNG_STAR_OVERALL_CEILING = {
  maxAge: 21,
  minMarketValue: 100_000_000,
  ceiling: 87,
} as const;

/** Age → current-ability curve (youth is penalised; peak is 25–28). */
export const AGE_SCORE_BRACKETS: readonly ScoreBracket[] = [
  { minValue: 16, score: 48 },
  { minValue: 17, score: 50 },
  { minValue: 18, score: 54 },
  { minValue: 19, score: 58 },
  { minValue: 20, score: 62 },
  { minValue: 21, score: 68 },
  { minValue: 22, score: 76 },
  { minValue: 23, score: 84 },
  { minValue: 24, score: 90 },
  { minValue: 25, score: 95 },
  { minValue: 26, score: 97 },
  { minValue: 27, score: 98 },
  { minValue: 28, score: 96 },
  { minValue: 29, score: 92 },
  { minValue: 30, score: 86 },
  { minValue: 31, score: 82 },
  { minValue: 32, score: 78 },
  { minValue: 33, score: 72 },
  { minValue: 34, score: 66 },
  { minValue: 35, score: 60 },
  { minValue: 36, score: 54 },
  { minValue: 37, score: 48 },
  { minValue: 38, score: 44 },
  { minValue: 39, score: 40 },
];

/** Softens MV floors for players who have not reached physical peak yet. */
export const YOUNG_PLAYER_FLOOR_REDUCTION: readonly ScoreBracket[] = [
  { minValue: 16, score: 5 },
  { minValue: 19, score: 4 },
  { minValue: 21, score: 3 },
  { minValue: 23, score: 1 },
];

/** League external id → tier score */
export const LEAGUE_TIER_SCORES: Readonly<Record<string, number>> = {
  GB1: 92,
  ES1: 91,
  L1: 90,
  IT1: 89,
  FR1: 88,
  TR1: 80,
  NL1: 78,
  PO1: 77,
};

export const DEFAULT_LEAGUE_SCORE = 55;
export const NO_LEAGUE_SCORE = 40;

export const OVERALL_PROFILE_BOUNDS: Readonly<Record<OverallProfileTag, OverallProfileBounds>> = {
  [OverallProfileTag.LEGEND_ACTIVE_OLD]: { floor: 85 },
  [OverallProfileTag.ELITE_CURRENT]: { floor: 88 },
  [OverallProfileTag.YOUNG_SUPERSTAR]: { ceiling: 89 },
  [OverallProfileTag.NORMAL_PLAYER]: { ceiling: 84 },
};

export const DEFAULT_CAREER_SCORE = 50;
export const DEFAULT_LEGACY_SCORE = 0;
