import type { MatchEventTypeDto, MatchTeamSideDto } from './match-simulation.js';
import type { PitchZoneDto } from './pitch-zones.js';

export type MatchFlowEventTypeDto = 'PASS' | 'DRIBBLE' | 'CROSS';

export type MatchVisualizationEventTypeDto = MatchEventTypeDto | MatchFlowEventTypeDto | 'FOUL';

export type MatchAttackPhaseDto = 'START' | 'PROGRESS' | 'END';

export type MatchAttackResultDto =
  | 'GOAL'
  | 'SHOT'
  | 'SHOT_ON_TARGET'
  | 'WOODWORK'
  | 'MISSED_PENALTY'
  | 'OFFSIDE_GOAL'
  | 'CORNER'
  | 'FREE_KICK'
  | 'FOUL'
  | 'CARD'
  | 'CLEARED'
  | null;

export interface MatchActivePlayerDto {
  readonly cardId: string | null;
  readonly displayName: string;
  readonly teamSide: MatchTeamSideDto;
}

export interface MatchEventVisualizationDto {
  readonly ballZone: PitchZoneDto;
  readonly previousBallZone: PitchZoneDto | null;
  readonly activePlayers: readonly MatchActivePlayerDto[];
  readonly attackChainId: string | null;
  readonly attackChainStep: number | null;
  readonly attackChainPlayers: readonly string[] | null;
  readonly attackPhase: MatchAttackPhaseDto | null;
  readonly attackResult: MatchAttackResultDto;
  readonly homeMomentum: number;
  readonly awayMomentum: number;
  readonly isReplayEligible: boolean;
}

export interface MatchMomentumDto {
  readonly home: number;
  readonly away: number;
  readonly homeTrend: number;
  readonly awayTrend: number;
}

export interface MatchAttackChainDto {
  readonly id: string;
  readonly teamSide: MatchTeamSideDto;
  readonly players: readonly string[];
  readonly result: MatchAttackResultDto;
}

export interface MatchLiveVisualizationDto {
  readonly ballZone: PitchZoneDto;
  readonly previousBallZone: PitchZoneDto | null;
  readonly activePlayers: readonly MatchActivePlayerDto[];
  readonly attackChain: MatchAttackChainDto | null;
  readonly momentum: MatchMomentumDto;
  readonly lastEventType: MatchVisualizationEventTypeDto | null;
  readonly highlightGoal: boolean;
}

export interface MatchReplaySnapshotDto {
  readonly eventId: string;
  readonly minute: number;
  readonly eventType: MatchEventTypeDto;
  readonly teamSide: MatchTeamSideDto;
  readonly playerName: string | null;
  readonly secondaryPlayerName: string | null;
  readonly attackChainPlayers: readonly string[] | null;
  readonly visualization: MatchEventVisualizationDto;
}
