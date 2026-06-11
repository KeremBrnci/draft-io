import type { MatchStateDto } from './match-simulation.js';

export type RoomLeagueStatusDto = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface RoomFixtureDto {
  readonly id: string;
  readonly roundNumber: number;
  readonly homeParticipantId: string;
  readonly awayParticipantId: string;
  readonly homeDisplayName: string;
  readonly awayDisplayName: string;
  readonly matchId: string | null;
  readonly matchStatus: string | null;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
}

export interface RoomLeagueStandingDto {
  readonly participantId: string;
  readonly displayName: string;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly goalDifference: number;
  readonly points: number;
  readonly rank: number;
}

export interface TeamReviewParticipantDto {
  readonly participantId: string;
  readonly displayName: string;
  readonly formationCode: string;
  readonly teamAverageOverall: number;
  readonly teamChemistry: number;
  readonly matchPower: number;
  readonly isRosterComplete: boolean;
  readonly selectedCoachName: string | null;
}

export interface TeamReviewStateDto {
  readonly lobbyCode: string;
  readonly phase: string;
  readonly allRostersComplete: boolean;
  readonly allCoachesSelected: boolean;
  readonly viewerIsHost: boolean;
  readonly canStartLeague: boolean;
  readonly participants: readonly TeamReviewParticipantDto[];
}

export interface RoomLeagueWinnerDto {
  readonly participantId: string;
  readonly displayName: string;
  readonly points: number;
}

export interface RoomLeagueStateDto {
  readonly id: string;
  readonly lobbyId: string;
  readonly status: RoomLeagueStatusDto;
  readonly fixtures: readonly RoomFixtureDto[];
  readonly standings: readonly RoomLeagueStandingDto[];
  readonly currentMatch: MatchStateDto | null;
  readonly completedMatchCount: number;
  readonly totalMatchCount: number;
  readonly winner: RoomLeagueWinnerDto | null;
}
