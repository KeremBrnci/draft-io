import type { OverallAlgorithmVersionCode } from '../enums/overall-algorithm-version.enum';
import type { OverallProfileTag } from '../enums/overall-profile-tag.enum';

import type { OverallComponentScores } from './overall-component-scores';

/**
 * Output of a successful overall calculation.
 * overall is always game-owned (1–99).
 */
export interface OverallCalculationResult {
  readonly algorithmVersion: OverallAlgorithmVersionCode;
  readonly components: OverallComponentScores;
  readonly rawScore: number;
  readonly finalOverall: number;
  readonly profileTag: OverallProfileTag | null;
  readonly appliedFloor: number | null;
  readonly appliedCeiling: number | null;
  /** @deprecated Use finalOverall — kept for backward compatibility with existing port consumers */
  readonly overall: number;
}
