import {
  INFERRED_CAREER_BRACKETS,
  INFERRED_LEGACY_BRACKETS,
  MARKET_VALUE_OVERALL_CEILINGS,
  MARKET_VALUE_OVERALL_FLOORS,
  STAR_LEAGUE_FLOOR_BRACKETS,
  VETERAN_LEGACY_BONUS,
  YOUNG_PLAYER_FLOOR_REDUCTION,
  YOUNG_STAR_OVERALL_CEILING,
  DEFAULT_CAREER_SCORE,
  DEFAULT_LEGACY_SCORE,
} from '../../domain/config/overall-v1.config';

import { clampScore, scoreFromBrackets } from './score-bracket.util';

export function inferCareerFromMarketValue(marketValue: number | null): number {
  if (marketValue === null || marketValue <= 0) {
    return DEFAULT_CAREER_SCORE;
  }

  return scoreFromBrackets(marketValue, INFERRED_CAREER_BRACKETS);
}

export function inferLegacyFromProfile(marketValue: number | null, age: number | null): number {
  if (marketValue === null || marketValue <= 0) {
    return DEFAULT_LEGACY_SCORE;
  }

  let score = scoreFromBrackets(marketValue, INFERRED_LEGACY_BRACKETS);

  if (age !== null) {
    let veteranBonus = 0;

    for (const tier of VETERAN_LEGACY_BONUS) {
      if (age >= tier.minAge && marketValue >= tier.minMarketValue) {
        veteranBonus = Math.max(veteranBonus, tier.bonus);
      }
    }

    score += veteranBonus;
  }

  return clampScore(score);
}

const STAR_LEAGUE_MIN_MARKET_VALUE = 20_000_000;

export function starLeagueFloorFromMarketValue(marketValue: number | null): number | null {
  if (marketValue === null || marketValue < STAR_LEAGUE_MIN_MARKET_VALUE) {
    return null;
  }

  return scoreFromBrackets(marketValue, STAR_LEAGUE_FLOOR_BRACKETS);
}

export function marketValueOverallFloor(
  marketValue: number | null,
  age: number | null = null,
): number | null {
  if (marketValue === null || marketValue <= 0) {
    return null;
  }

  let floor: number | null = null;

  for (const bracket of MARKET_VALUE_OVERALL_FLOORS) {
    if (marketValue >= bracket.minValue) {
      floor = bracket.floor;
    }
  }

  if (floor === null || age === null) {
    return floor;
  }

  const reduction = scoreFromBrackets(age, YOUNG_PLAYER_FLOOR_REDUCTION);
  return Math.max(1, floor - reduction);
}

export function marketValueOverallCeiling(
  marketValue: number | null,
  age: number | null,
): number | null {
  if (marketValue === null || marketValue <= 0) {
    return null;
  }

  if (
    age !== null &&
    age <= YOUNG_STAR_OVERALL_CEILING.maxAge &&
    marketValue >= YOUNG_STAR_OVERALL_CEILING.minMarketValue
  ) {
    return YOUNG_STAR_OVERALL_CEILING.ceiling;
  }

  let ceiling: number | null = null;

  for (const bracket of MARKET_VALUE_OVERALL_CEILINGS) {
    if (marketValue >= bracket.minValue) {
      ceiling = bracket.floor;
    }
  }

  return ceiling;
}
