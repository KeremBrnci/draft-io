import { expandPositionFilterCodes } from '@draft-io/shared-utils';

import type { PositionWeightConfig } from '../config/default-draft-balance.config';
import type { DraftPoolCard } from '../models/draft-pool-card';

export class PositionCompatibilityService {
  constructor(private readonly weights: PositionWeightConfig) {}

  getWeight(card: DraftPoolCard, positionCode: string): number {
    const codes = expandPositionFilterCodes(positionCode);
    let best = 0;

    for (const code of codes) {
      best = Math.max(best, this.getWeightForExactCode(card, code));
    }

    return best;
  }

  isEligible(card: DraftPoolCard, positionCode: string): boolean {
    return this.getWeight(card, positionCode) > 0;
  }

  private getWeightForExactCode(card: DraftPoolCard, positionCode: string): number {
    const normalized = positionCode.toUpperCase();
    const matching = card.positions.filter(
      (position) => position.positionCode.toUpperCase() === normalized,
    );

    if (matching.length === 0) {
      return 0;
    }

    const hasPrimary = matching.some((position) => position.isPrimary);
    if (hasPrimary) {
      return this.weights.primary;
    }

    const sorted = [...matching].sort((left, right) => left.sortOrder - right.sortOrder);
    const firstMatch = sorted[0];
    if (firstMatch === undefined) {
      return 0;
    }

    const primaryPosition = card.positions.find((position) => position.isPrimary);
    if (primaryPosition === undefined) {
      return this.weights.secondary;
    }

    const nonPrimaryPositions = card.positions
      .filter((position) => !position.isPrimary)
      .sort((left, right) => left.sortOrder - right.sortOrder);

    const secondaryIndex = nonPrimaryPositions.findIndex(
      (position) => position.positionCode.toUpperCase() === normalized,
    );

    if (secondaryIndex === 0) {
      return this.weights.secondary;
    }

    if (secondaryIndex === 1) {
      return this.weights.tertiary;
    }

    return this.weights.tertiary;
  }
}
