import type { DraftBalanceConfigDto, DraftTierCodeDto } from '@draft-io/shared-types';

export class TierClassifier {
  constructor(private readonly config: DraftBalanceConfigDto) {}

  classify(overall: number): DraftTierCodeDto {
    for (const tier of this.config.tiers) {
      const withinMin = overall >= tier.minOverall;
      const withinMax = tier.maxOverall === null || overall <= tier.maxOverall;
      if (withinMin && withinMax) {
        return tier.code;
      }
    }

    if (overall >= (this.config.tiers[0]?.minOverall ?? 92)) {
      return 'S';
    }

    return 'D';
  }

  isEliteTier(tierCode: DraftTierCodeDto): boolean {
    return this.config.eliteTierCodes.includes(tierCode);
  }
}
