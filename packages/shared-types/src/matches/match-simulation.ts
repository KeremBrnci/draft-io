export type MatchStatusDto =
  | 'SCHEDULED'
  | 'PRE_MATCH'
  | 'LIVE'
  | 'HALF_TIME'
  | 'FULL_TIME'
  | 'PAUSED';

export type MatchEventTypeDto =
  | 'DANGEROUS_ATTACK'
  | 'GOAL_CHANCE'
  | 'SHOT'
  | 'SHOT_ON_TARGET'
  | 'GOAL'
  | 'OFFSIDE_GOAL'
  | 'PENALTY'
  | 'MISSED_PENALTY'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'CORNER'
  | 'FREE_KICK'
  | 'WOODWORK'
  | 'KICK_OFF'
  | 'HALF_TIME'
  | 'FULL_TIME';

export type MatchTeamSideDto = 'HOME' | 'AWAY' | 'NEUTRAL';

export interface MatchPlayerSnapshotDto {
  readonly cardId: string;
  readonly playerId: string;
  readonly displayName: string;
  readonly positionCode: string;
  readonly overall: number;
}

export interface MatchTeamSnapshotDto {
  readonly participantId: string;
  readonly displayName: string;
  readonly formationCode: string;
  readonly teamAverageOverall: number;
  readonly teamChemistry: number;
  readonly matchPower: number;
  readonly players: readonly MatchPlayerSnapshotDto[];
}

export interface MatchEventDto {
  readonly id: string;
  readonly minute: number;
  readonly eventType: MatchEventTypeDto;
  readonly teamSide: MatchTeamSideDto;
  readonly playerName: string | null;
  readonly secondaryPlayerName: string | null;
  readonly cardId: string | null;
  readonly commentary: string;
  readonly xgValue: number | null;
  readonly isGoal: boolean;
}

export interface MatchStatisticsDto {
  readonly homePossession: number;
  readonly awayPossession: number;
  readonly homeShots: number;
  readonly awayShots: number;
  readonly homeShotsOnTarget: number;
  readonly awayShotsOnTarget: number;
  readonly homeCorners: number;
  readonly awayCorners: number;
  readonly homeFouls: number;
  readonly awayFouls: number;
  readonly homeYellowCards: number;
  readonly awayYellowCards: number;
  readonly homeRedCards: number;
  readonly awayRedCards: number;
  readonly homeDangerousAttacks: number;
  readonly awayDangerousAttacks: number;
  readonly playerRatings: Readonly<Record<string, number>>;
}

export interface MatchStateDto {
  readonly id: string;
  readonly leagueId: string;
  readonly status: MatchStatusDto;
  readonly currentMinute: number;
  readonly displayMinute: string;
  readonly firstHalfStoppageMinutes: number;
  readonly secondHalfStoppageMinutes: number;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly homeXg: number;
  readonly awayXg: number;
  readonly homeParticipantId: string;
  readonly awayParticipantId: string;
  readonly homeDisplayName: string;
  readonly awayDisplayName: string;
  readonly manOfTheMatchCardId: string | null;
  readonly manOfTheMatchPlayerName: string | null;
  readonly events: readonly MatchEventDto[];
  readonly statistics: MatchStatisticsDto | null;
}
