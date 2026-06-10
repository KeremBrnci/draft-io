import type { PlayerPosition } from './player-position.js';
import type { PlayerPositionAssignmentDto } from './player-position-assignment.js';
import type { PlayerStatus } from './player-status.js';

/** Identity record — gameplay strength is on Card, not Player. */
export interface PlayerSummary {
  readonly id: string;
  readonly provider: string | null;
  readonly externalId: string | null;
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName: string;
  readonly birthDate: string | null;
  readonly nationality: string;
  readonly teamId: string | null;
  readonly leagueId: string | null;
  readonly positions: readonly PlayerPositionAssignmentDto[];
  /** Primary position shorthand for legacy clients. */
  readonly position: PlayerPosition;
  /** Secondary positions shorthand for legacy clients. */
  readonly secondaryPositions: readonly PlayerPosition[];
  readonly marketValue: number | null;
  readonly imageUrl: string | null;
  readonly status: PlayerStatus;
}
