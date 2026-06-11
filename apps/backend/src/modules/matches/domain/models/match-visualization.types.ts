import type { PitchZoneDto } from '@draft-io/shared-types';

export type PitchZone = PitchZoneDto;

export interface MatchEventVisualization {
  readonly ballZone: PitchZone;
  readonly previousBallZone: PitchZone | null;
  readonly activePlayerCardIds: readonly string[];
  readonly activePlayerNames: readonly string[];
  readonly secondaryPlayerCardId: string | null;
  readonly attackChainId: string | null;
  readonly attackChainStep: number | null;
  readonly attackChainPlayers: readonly string[] | null;
  readonly attackPhase: 'START' | 'PROGRESS' | 'END' | null;
  readonly attackResult: string | null;
  readonly homeMomentum: number;
  readonly awayMomentum: number;
  readonly isReplayEligible: boolean;
}
