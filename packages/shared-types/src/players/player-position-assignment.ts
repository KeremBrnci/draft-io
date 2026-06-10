import type { PlayerPosition } from './player-position.js';

/** One position assignment on a player (primary or secondary). */
export interface PlayerPositionAssignmentDto {
  readonly positionCode: PlayerPosition;
  readonly isPrimary: boolean;
}
