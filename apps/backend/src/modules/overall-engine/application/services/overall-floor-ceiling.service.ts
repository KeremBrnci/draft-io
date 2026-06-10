import { OVERALL_PROFILE_BOUNDS } from '../../domain/config/overall-v1.config';
import type { OverallProfileTag } from '../../domain/enums/overall-profile-tag.enum';
import { marketValueOverallCeiling, marketValueOverallFloor } from '../scoring/inferred-score.util';
import { clampOverall } from '../scoring/score-bracket.util';

export interface FloorCeilingResult {
  readonly finalOverall: number;
  readonly appliedFloor: number | null;
  readonly appliedCeiling: number | null;
}

export class OverallFloorCeilingService {
  apply(
    rawOverall: number,
    profileTag: OverallProfileTag | null,
    marketValue: number | null = null,
    age: number | null = null,
  ): FloorCeilingResult {
    const rounded = clampOverall(rawOverall);
    let finalOverall = rounded;
    let appliedFloor: number | null = null;
    let appliedCeiling: number | null = null;

    if (profileTag !== null) {
      const bounds = OVERALL_PROFILE_BOUNDS[profileTag];

      if (bounds.floor !== undefined && finalOverall < bounds.floor) {
        finalOverall = bounds.floor;
        appliedFloor = bounds.floor;
      }

      if (bounds.ceiling !== undefined && finalOverall > bounds.ceiling) {
        finalOverall = bounds.ceiling;
        appliedCeiling = bounds.ceiling;
      }
    }

    const marketValueFloor = marketValueOverallFloor(marketValue, age);
    if (marketValueFloor !== null && finalOverall < marketValueFloor) {
      finalOverall = marketValueFloor;
      appliedFloor = marketValueFloor;
    }

    const marketValueCeiling = marketValueOverallCeiling(marketValue, age);
    if (marketValueCeiling !== null && finalOverall > marketValueCeiling) {
      finalOverall = marketValueCeiling;
      appliedCeiling = marketValueCeiling;
    }

    return {
      finalOverall: clampOverall(finalOverall),
      appliedFloor,
      appliedCeiling,
    };
  }
}
