import type { MatchPowerConfig } from '../config/default-draft-balance.config';
import type { MatchPowerResult } from '../models/match-power-result';

export class MatchPowerCalculator {
  constructor(private readonly config: MatchPowerConfig) {}

  chemistryMultiplier(teamChemistry: number): number {
    const boostRatio = teamChemistry / this.config.chemistryScaleMax;
    const boost = boostRatio * (this.config.chemistryMaxBoostPercent / 100);
    const multiplier = 1 + boost;

    return Math.min(this.config.maxMultiplier, Math.max(this.config.minMultiplier, multiplier));
  }

  calculate(teamAverageOverall: number, teamChemistry: number): MatchPowerResult {
    const chemistryMultiplier = this.chemistryMultiplier(teamChemistry);
    const matchPower = teamAverageOverall * chemistryMultiplier;

    return {
      teamAverageOverall,
      teamChemistry,
      chemistryMultiplier,
      matchPower: Math.round(matchPower * 10) / 10,
    };
  }
}
