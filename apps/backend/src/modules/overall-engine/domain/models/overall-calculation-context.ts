import type { PlayerPositionAssignmentDto } from '@draft-io/shared-types';

import type { OverallProfileTag } from '../enums/overall-profile-tag.enum';

/**
 * Inputs for overall calculation. apiOverallHint is provider metadata only —
 * strategies decide whether and how to use it. Never assign overall from hint directly.
 */
export interface OverallCalculationContext {
  readonly playerId: string;
  readonly positions: readonly PlayerPositionAssignmentDto[];
  /** Primary position shorthand for legacy strategies. */
  readonly primaryPosition: string;
  /** Secondary position codes shorthand for legacy strategies. */
  readonly secondaryPositions: readonly string[];
  readonly age: number | null;
  readonly marketValue: number | null;
  readonly nationality: string;
  /** Transfermarkt-style league code (GB1, ES1, …) for league tier scoring */
  readonly leagueExternalId: string | null;
  /** Manually stored career achievement score (0–100) until auto-collection ships */
  readonly careerScore: number;
  /** Manually stored legacy modifier score (0–100) until auto-collection ships */
  readonly legacyScore: number;
  /** Optional profile tag for configurable floor/ceiling rules */
  readonly profileTag: OverallProfileTag | null;
  /** Provider-reported rating — untrusted; optional strategy input only */
  readonly apiOverallHint: number | null;
}
