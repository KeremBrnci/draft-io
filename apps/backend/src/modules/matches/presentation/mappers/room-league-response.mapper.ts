import {
  deriveMatchStoppageTime,
  formatMatchMinuteLabel,
  type MatchStateDto,
  type RoomLeagueStateDto,
  type TeamReviewStateDto,
} from '@draft-io/shared-types';

import {
  decodeMatchInRound,
  decodeScheduleRound,
} from '../../../simulation/domain/services/fixture-generator.service';

import type { Lobby } from '../../../lobbies/domain/entities/lobby.entity';
import { RoomPhase } from '../../../lobbies/domain/enums/room-phase.enum';
import type {
  RoomFixtureRecord,
  RoomLeagueRecord,
  RoomMatchEventRecord,
  RoomMatchRecord,
  RoomMatchStatisticRecord,
  RoomStandingRecord,
} from '../../domain/repositories/room-league.repository';

export function toTeamReviewStateDto(
  lobby: Lobby,
  participants: TeamReviewStateDto['participants'],
  viewer: { readonly viewerIsHost: boolean },
): TeamReviewStateDto {
  return {
    lobbyCode: lobby.code.value,
    phase: lobby.phase,
    allRostersComplete: participants.every((entry) => entry.isRosterComplete),
    allCoachesSelected: lobby.allCoachesSelected,
    viewerIsHost: viewer.viewerIsHost,
    canStartLeague: lobby.phase === RoomPhase.TEAM_REVIEW && viewer.viewerIsHost,
    participants,
  };
}

export function toRoomLeagueStateDto(input: {
  readonly league: RoomLeagueRecord;
  readonly lobbyCode: string;
  readonly fixtures: readonly RoomFixtureRecord[];
  readonly standings: readonly RoomStandingRecord[];
  readonly currentMatch: RoomMatchRecord | null;
  readonly completedMatchCount: number;
  readonly participantNames: ReadonlyMap<string, string>;
  readonly currentMatchEvents?: readonly RoomMatchEventRecord[];
  readonly currentMatchStatistics?: RoomMatchStatisticRecord | null;
}): RoomLeagueStateDto {
  return {
    id: input.league.id,
    lobbyId: input.league.lobbyId,
    status: input.league.status as RoomLeagueStateDto['status'],
    fixtures: input.fixtures.map((fixture) => ({
      id: fixture.id,
      roundNumber: fixture.roundNumber,
      scheduleRound: decodeScheduleRound(fixture.roundNumber),
      matchInRound: decodeMatchInRound(fixture.roundNumber),
      homeParticipantId: fixture.homeParticipantId,
      awayParticipantId: fixture.awayParticipantId,
      homeDisplayName: input.participantNames.get(fixture.homeParticipantId) ?? 'Home',
      awayDisplayName: input.participantNames.get(fixture.awayParticipantId) ?? 'Away',
      matchId: fixture.matchId,
      matchStatus: fixture.matchStatus,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
    })),
    standings: input.standings.map((row) => ({
      participantId: row.participantId,
      displayName: row.displayName,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
      points: row.points,
      rank: row.rank,
    })),
    currentMatch:
      input.currentMatch === null
        ? null
        : toMatchStateDto(
            input.currentMatch,
            input.currentMatchEvents ?? [],
            input.currentMatchStatistics ?? null,
          ),
    completedMatchCount: input.completedMatchCount,
    totalMatchCount: input.fixtures.length,
    winner: resolveLeagueWinner(input.league.status, input.standings),
  };
}

function resolveLeagueWinner(
  status: string,
  standings: readonly RoomStandingRecord[],
): RoomLeagueStateDto['winner'] {
  if (status !== 'COMPLETED') {
    return null;
  }

  const leader = standings.find((row) => row.rank === 1);
  if (leader === undefined) {
    return null;
  }

  return {
    participantId: leader.participantId,
    displayName: leader.displayName,
    points: leader.points,
  };
}

function countRevealedGoals(
  events: readonly RoomMatchEventRecord[],
  teamSide: 'HOME' | 'AWAY',
): number {
  return events.filter(
    (event) => event.isGoal && event.eventType === 'GOAL' && event.teamSide === teamSide,
  ).length;
}

function resolveDisplayedMatchScores(
  match: RoomMatchRecord,
  events: readonly RoomMatchEventRecord[],
): { readonly homeScore: number; readonly awayScore: number } {
  if (match.status === 'FULL_TIME') {
    return { homeScore: match.homeScore, awayScore: match.awayScore };
  }

  return {
    homeScore: countRevealedGoals(events, 'HOME'),
    awayScore: countRevealedGoals(events, 'AWAY'),
  };
}

export function toMatchStateDto(
  match: RoomMatchRecord,
  events: readonly RoomMatchEventRecord[],
  statistics: RoomMatchStatisticRecord | null = null,
): MatchStateDto {
  const scores = resolveDisplayedMatchScores(match, events);
  const stoppage = deriveMatchStoppageTime(match.simulationSeed);

  return {
    id: match.id,
    leagueId: match.leagueId,
    status: match.status as MatchStateDto['status'],
    currentMinute: match.currentMinute,
    displayMinute: formatMatchMinuteLabel(match.currentMinute, stoppage),
    firstHalfStoppageMinutes: stoppage.firstHalfMinutes,
    secondHalfStoppageMinutes: stoppage.secondHalfMinutes,
    homeScore: scores.homeScore,
    awayScore: scores.awayScore,
    homeXg: match.homeXg,
    awayXg: match.awayXg,
    homeParticipantId: match.homeParticipantId,
    awayParticipantId: match.awayParticipantId,
    homeDisplayName: match.homeSnapshot.displayName,
    awayDisplayName: match.awaySnapshot.displayName,
    manOfTheMatchCardId: match.manOfTheMatchCardId,
    manOfTheMatchPlayerName: resolvePlayerName(
      match.homeSnapshot,
      match.awaySnapshot,
      match.manOfTheMatchCardId,
    ),
    events: events.map((event) => ({
      id: event.id,
      minute: event.minute,
      eventType: event.eventType as MatchStateDto['events'][number]['eventType'],
      teamSide: event.teamSide as MatchStateDto['events'][number]['teamSide'],
      playerName: event.playerName,
      secondaryPlayerName: event.secondaryPlayerName,
      cardId: event.cardId,
      commentary: event.commentary,
      xgValue: event.xgValue,
      isGoal: event.isGoal,
    })),
    statistics:
      statistics === null
        ? null
        : {
            homePossession: statistics.homePossession,
            awayPossession: statistics.awayPossession,
            homeShots: statistics.homeShots,
            awayShots: statistics.awayShots,
            homeShotsOnTarget: statistics.homeShotsOnTarget,
            awayShotsOnTarget: statistics.awayShotsOnTarget,
            homeCorners: statistics.homeCorners,
            awayCorners: statistics.awayCorners,
            homeFouls: statistics.homeFouls,
            awayFouls: statistics.awayFouls,
            homeYellowCards: statistics.homeYellowCards,
            awayYellowCards: statistics.awayYellowCards,
            homeRedCards: statistics.homeRedCards,
            awayRedCards: statistics.awayRedCards,
            homeDangerousAttacks: statistics.homeDangerousAttacks,
            awayDangerousAttacks: statistics.awayDangerousAttacks,
            playerRatings: statistics.playerRatings,
          },
  };
}

function resolvePlayerName(
  homeSnapshot: RoomMatchRecord['homeSnapshot'],
  awaySnapshot: RoomMatchRecord['awaySnapshot'],
  cardId: string | null,
): string | null {
  if (cardId === null) {
    return null;
  }

  const player =
    homeSnapshot.players.find((entry) => entry.cardId === cardId) ??
    awaySnapshot.players.find((entry) => entry.cardId === cardId);

  return player?.displayName ?? null;
}
