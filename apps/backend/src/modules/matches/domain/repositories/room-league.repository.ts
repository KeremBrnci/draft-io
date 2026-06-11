import type {
  GeneratedMatchEvent,
  MatchStatisticsSnapshot,
  MatchTeamSnapshot,
} from '../../../simulation/domain/models/match-simulation.types';

export const ROOM_LEAGUE_REPOSITORY = Symbol('ROOM_LEAGUE_REPOSITORY');

export interface RoomLeagueRecord {
  readonly id: string;
  readonly lobbyId: string;
  readonly status: string;
}

export interface RoomFixtureRecord {
  readonly id: string;
  readonly leagueId: string;
  readonly roundNumber: number;
  readonly homeParticipantId: string;
  readonly awayParticipantId: string;
  readonly matchId: string | null;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly matchStatus: string | null;
}

export interface RoomMatchRecord {
  readonly id: string;
  readonly leagueId: string;
  readonly homeParticipantId: string;
  readonly awayParticipantId: string;
  readonly status: string;
  readonly currentMinute: number;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly homeXg: number;
  readonly awayXg: number;
  readonly simulationSeed: number;
  readonly homeSnapshot: MatchTeamSnapshot;
  readonly awaySnapshot: MatchTeamSnapshot;
  readonly manOfTheMatchCardId: string | null;
  readonly startedAt: Date | null;
  readonly finishedAt: Date | null;
}

export interface RoomMatchEventRecord {
  readonly id: string;
  readonly matchId: string;
  readonly minute: number;
  readonly eventType: string;
  readonly teamSide: string;
  readonly playerName: string | null;
  readonly secondaryPlayerName: string | null;
  readonly cardId: string | null;
  readonly commentary: string;
  readonly xgValue: number | null;
  readonly isGoal: boolean;
  readonly sortOrder: number;
  readonly revealedAt: Date | null;
}

export interface RoomStandingRecord {
  readonly id: string;
  readonly leagueId: string;
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

export interface CreateLeagueInput {
  readonly lobbyId: string;
  readonly participantIds: readonly string[];
  readonly participantNames: ReadonlyMap<string, string>;
}

export interface CreateMatchInput {
  readonly leagueId: string;
  readonly fixtureId: string;
  readonly homeParticipantId: string;
  readonly awayParticipantId: string;
  readonly simulationSeed: number;
  readonly homeSnapshot: MatchTeamSnapshot;
  readonly awaySnapshot: MatchTeamSnapshot;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly homeXg: number;
  readonly awayXg: number;
  readonly manOfTheMatchCardId: string | null;
  readonly events: readonly GeneratedMatchEvent[];
  readonly statistics: MatchStatisticsSnapshot;
}

export interface RoomMatchStatisticRecord {
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

export interface RoomLeagueRepository {
  findByLobbyId(lobbyId: string): Promise<RoomLeagueRecord | null>;
  createLeague(input: CreateLeagueInput): Promise<RoomLeagueRecord>;
  listFixtures(leagueId: string): Promise<readonly RoomFixtureRecord[]>;
  listStandings(leagueId: string): Promise<readonly RoomStandingRecord[]>;
  findMatchById(matchId: string): Promise<RoomMatchRecord | null>;
  findMatchStatistics(matchId: string): Promise<RoomMatchStatisticRecord | null>;
  findLiveMatch(leagueId: string): Promise<RoomMatchRecord | null>;
  findCurrentMatch(leagueId: string): Promise<RoomMatchRecord | null>;
  findNextFixture(leagueId: string): Promise<RoomFixtureRecord | null>;
  createMatch(input: CreateMatchInput): Promise<RoomMatchRecord>;
  listMatchEvents(matchId: string, revealedOnly: boolean): Promise<readonly RoomMatchEventRecord[]>;
  updateMatchProgress(input: {
    readonly matchId: string;
    readonly status: string;
    readonly currentMinute: number;
    readonly homeScore: number;
    readonly awayScore: number;
    readonly revealedEventIds: readonly string[];
  }): Promise<RoomMatchRecord>;
  finalizeMatch(input: {
    readonly matchId: string;
    readonly homeScore: number;
    readonly awayScore: number;
    readonly homeParticipantId: string;
    readonly awayParticipantId: string;
  }): Promise<boolean>;
  updateLeagueStatus(leagueId: string, status: string): Promise<void>;
  countCompletedMatches(leagueId: string): Promise<number>;
  deleteByLobbyId(lobbyId: string): Promise<void>;
  findById(id: string): Promise<RoomLeagueRecord | null>;
}
