export type MatchEventType =
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

export type MatchTeamSide = 'HOME' | 'AWAY' | 'NEUTRAL';

export interface MatchPlayerSnapshot {
  readonly cardId: string;
  readonly playerId: string;
  readonly displayName: string;
  readonly positionCode: string;
  readonly overall: number;
}

export interface MatchTeamSnapshot {
  readonly participantId: string;
  readonly displayName: string;
  readonly formationCode: string;
  readonly teamAverageOverall: number;
  readonly teamChemistry: number;
  readonly matchPower: number;
  readonly players: readonly MatchPlayerSnapshot[];
}

export interface GeneratedMatchEvent {
  readonly minute: number;
  readonly eventType: MatchEventType;
  readonly teamSide: MatchTeamSide;
  readonly playerName: string | null;
  readonly secondaryPlayerName: string | null;
  readonly cardId: string | null;
  readonly commentary: string;
  readonly xgValue: number | null;
  readonly isGoal: boolean;
}

export interface MatchStatisticsSnapshot {
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

export interface SimulatedMatchResult {
  readonly homeScore: number;
  readonly awayScore: number;
  readonly homeXg: number;
  readonly awayXg: number;
  readonly events: readonly GeneratedMatchEvent[];
  readonly statistics: MatchStatisticsSnapshot;
  readonly manOfTheMatchCardId: string | null;
  readonly seed: number;
}

export interface MatchSimulationConfig {
  readonly homeAdvantagePercent: number;
  readonly chemistryImpactCap: number;
  readonly targetEventCountMin: number;
  readonly targetEventCountMax: number;
  readonly msPerMinute: number;
}

export const DEFAULT_MATCH_SIMULATION_CONFIG: MatchSimulationConfig = {
  homeAdvantagePercent: 5,
  chemistryImpactCap: 0.1,
  targetEventCountMin: 24,
  targetEventCountMax: 38,
  msPerMinute: 400,
};
