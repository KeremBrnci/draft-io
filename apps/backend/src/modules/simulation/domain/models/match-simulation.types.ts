export type MatchEventType =
  | 'PASS'
  | 'DRIBBLE'
  | 'CROSS'
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
  | 'FOUL'
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

export interface GeneratedMatchEventVisualization {
  readonly ballZone: string;
  readonly previousBallZone: string | null;
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

export interface GeneratedMatchEvent {
  readonly minute: number;
  readonly eventType: MatchEventType;
  readonly teamSide: MatchTeamSide;
  readonly playerName: string | null;
  readonly secondaryPlayerName: string | null;
  readonly cardId: string | null;
  readonly secondaryCardId?: string | null;
  readonly commentary: string;
  readonly xgValue: number | null;
  readonly isGoal: boolean;
  readonly visualization?: GeneratedMatchEventVisualization | null;
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
  readonly initialPlayerRatings: Readonly<Record<string, number>>;
  readonly playerRatings: Readonly<Record<string, number>>;
}

export interface MutableMatchStatCounters {
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeCorners: number;
  awayCorners: number;
  homeFouls: number;
  awayFouls: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
  homeDangerousAttacks: number;
  awayDangerousAttacks: number;
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

export type MatchGoalProfile = 'scoreless' | 'lively' | 'thriller';

export interface MatchGoalDistributionConfig {
  readonly scorelessMatchRate: number;
  readonly thrillerMatchRate: number;
  readonly livelyGoalChanceMultiplier: number;
  readonly thrillerGoalChanceMultiplier: number;
  readonly livelyMinimumGoals: number;
  readonly thrillerMinimumGoals: number;
}

export interface MatchStrengthWeights {
  readonly overall: number;
  readonly chemistry: number;
  readonly formation: number;
  readonly home: number;
  readonly randomness: number;
}

export interface MatchSimulationConfig {
  readonly homeAdvantagePercent: number;
  readonly chemistryConversionCap: number;
  readonly strengthWeights: MatchStrengthWeights;
  readonly baseTeamXg: number;
  readonly minTeamXg: number;
  readonly maxTeamXg: number;
  readonly goalConversionBase: number;
  readonly goalConversionVariance: number;
  readonly penaltyConversionRate: number;
  readonly targetEventCountMin: number;
  readonly targetEventCountMax: number;
  readonly msPerMinute: number;
  readonly warmupDelayMs: number;
  readonly halfTimeDelayMs: number;
  readonly nextMatchDelayMs: number;
  readonly goalCooldownMinutes: number;
  readonly penaltyMatchRate: number;
  readonly goalDistribution: MatchGoalDistributionConfig;
}

export const DEFAULT_MATCH_STRENGTH_WEIGHTS: MatchStrengthWeights = {
  overall: 0.65,
  chemistry: 0.2,
  formation: 0.1,
  home: 0.015,
  randomness: 0.035,
};

export const DEFAULT_MATCH_GOAL_DISTRIBUTION_CONFIG: MatchGoalDistributionConfig = {
  scorelessMatchRate: 0.015,
  thrillerMatchRate: 0.38,
  livelyGoalChanceMultiplier: 0.58,
  thrillerGoalChanceMultiplier: 0.84,
  livelyMinimumGoals: 1,
  thrillerMinimumGoals: 2,
};

export const DEFAULT_MATCH_SIMULATION_CONFIG: MatchSimulationConfig = {
  homeAdvantagePercent: 1.5,
  chemistryConversionCap: 0.12,
  strengthWeights: DEFAULT_MATCH_STRENGTH_WEIGHTS,
  baseTeamXg: 1.6,
  minTeamXg: 0.8,
  maxTeamXg: 4.0,
  goalConversionBase: 1.58,
  goalConversionVariance: 0.48,
  penaltyConversionRate: 0.85,
  targetEventCountMin: 22,
  targetEventCountMax: 38,
  msPerMinute: 1000,
  warmupDelayMs: 3250,
  halfTimeDelayMs: 3900,
  nextMatchDelayMs: 5200,
  goalCooldownMinutes: 1,
  penaltyMatchRate: 0.25,
  goalDistribution: DEFAULT_MATCH_GOAL_DISTRIBUTION_CONFIG,
};
