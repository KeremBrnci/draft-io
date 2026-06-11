import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import type { MatchTeamSnapshot } from '../../../simulation/domain/models/match-simulation.types';
import { generateDoubleRoundRobinFixtures } from '../../../simulation/domain/services/fixture-generator.service';
import type {
  CreateLeagueInput,
  CreateMatchInput,
  RoomFixtureRecord,
  RoomLeagueRecord,
  RoomLeagueRepository,
  RoomMatchEventRecord,
  RoomMatchRecord,
  RoomStandingRecord,
} from '../../domain/repositories/room-league.repository';

@Injectable()
export class PrismaRoomLeagueRepository implements RoomLeagueRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<RoomLeagueRecord | null> {
    const record = await this.prisma.roomLeague.findUnique({ where: { id } });
    return record === null
      ? null
      : { id: record.id, lobbyId: record.lobbyId, status: record.status };
  }

  async deleteByLobbyId(lobbyId: string): Promise<void> {
    await this.prisma.roomLeague.deleteMany({ where: { lobbyId } });
  }

  async findByLobbyId(lobbyId: string): Promise<RoomLeagueRecord | null> {
    const record = await this.prisma.roomLeague.findUnique({ where: { lobbyId } });
    return record === null
      ? null
      : { id: record.id, lobbyId: record.lobbyId, status: record.status };
  }

  async createLeague(input: CreateLeagueInput): Promise<RoomLeagueRecord> {
    const fixtures = generateDoubleRoundRobinFixtures(input.participantIds);
    const leagueId = randomUUID();

    await this.prisma.$transaction(async (tx) => {
      await tx.roomLeague.create({
        data: {
          id: leagueId,
          lobbyId: input.lobbyId,
          status: 'PENDING',
        },
      });

      await tx.roomFixture.createMany({
        data: fixtures.map((fixture) => ({
          id: randomUUID(),
          leagueId,
          roundNumber: fixture.roundNumber,
          homeParticipantId: fixture.homeParticipantId,
          awayParticipantId: fixture.awayParticipantId,
        })),
      });

      await tx.roomLeagueStanding.createMany({
        data: input.participantIds.map((participantId, index) => ({
          id: randomUUID(),
          leagueId,
          participantId,
          displayName: input.participantNames.get(participantId) ?? `Player ${index + 1}`,
          rank: index + 1,
        })),
      });
    });

    return { id: leagueId, lobbyId: input.lobbyId, status: 'PENDING' };
  }

  async listFixtures(leagueId: string): Promise<readonly RoomFixtureRecord[]> {
    const records = await this.prisma.roomFixture.findMany({
      where: { leagueId },
      orderBy: { roundNumber: 'asc' },
      include: {
        match: {
          select: {
            status: true,
            homeScore: true,
            awayScore: true,
          },
        },
      },
    });
    return records.map((record) => ({
      id: record.id,
      leagueId: record.leagueId,
      roundNumber: record.roundNumber,
      homeParticipantId: record.homeParticipantId,
      awayParticipantId: record.awayParticipantId,
      matchId: record.matchId,
      homeScore: record.match?.homeScore ?? null,
      awayScore: record.match?.awayScore ?? null,
      matchStatus: record.match?.status ?? null,
    }));
  }

  async listStandings(leagueId: string): Promise<readonly RoomStandingRecord[]> {
    const records = await this.prisma.roomLeagueStanding.findMany({
      where: { leagueId },
      orderBy: [{ points: 'desc' }, { goalDifference: 'desc' }, { goalsFor: 'desc' }],
    });
    return records.map((record, index) => ({
      id: record.id,
      leagueId: record.leagueId,
      participantId: record.participantId,
      displayName: record.displayName,
      played: record.played,
      won: record.won,
      drawn: record.drawn,
      lost: record.lost,
      goalsFor: record.goalsFor,
      goalsAgainst: record.goalsAgainst,
      goalDifference: record.goalDifference,
      points: record.points,
      rank: index + 1,
    }));
  }

  async findMatchStatistics(matchId: string) {
    const record = await this.prisma.roomMatchStatistic.findUnique({ where: { matchId } });
    if (record === null) {
      return null;
    }
    return {
      homePossession: record.homePossession,
      awayPossession: record.awayPossession,
      homeShots: record.homeShots,
      awayShots: record.awayShots,
      homeShotsOnTarget: record.homeShotsOnTarget,
      awayShotsOnTarget: record.awayShotsOnTarget,
      homeCorners: record.homeCorners,
      awayCorners: record.awayCorners,
      homeFouls: record.homeFouls,
      awayFouls: record.awayFouls,
      homeYellowCards: record.homeYellowCards,
      awayYellowCards: record.awayYellowCards,
      homeRedCards: record.homeRedCards,
      awayRedCards: record.awayRedCards,
      homeDangerousAttacks: record.homeDangerousAttacks,
      awayDangerousAttacks: record.awayDangerousAttacks,
      playerRatings: record.playerRatings as Record<string, number>,
    };
  }

  async findMatchById(matchId: string): Promise<RoomMatchRecord | null> {
    const record = await this.prisma.roomMatch.findUnique({ where: { id: matchId } });
    return record === null ? null : this.toMatchRecord(record);
  }

  async findLiveMatch(leagueId: string): Promise<RoomMatchRecord | null> {
    const record = await this.prisma.roomMatch.findFirst({
      where: {
        leagueId,
        status: { in: ['LIVE', 'HALF_TIME', 'PAUSED'] },
      },
      orderBy: { createdAt: 'desc' },
    });
    return record === null ? null : this.toMatchRecord(record);
  }

  async findCurrentMatch(leagueId: string): Promise<RoomMatchRecord | null> {
    const live = await this.findLiveMatch(leagueId);
    if (live !== null) {
      return live;
    }

    const record = await this.prisma.roomMatch.findFirst({
      where: { leagueId, status: 'FULL_TIME' },
      orderBy: { finishedAt: 'desc' },
    });
    return record === null ? null : this.toMatchRecord(record);
  }

  async findNextFixture(leagueId: string): Promise<RoomFixtureRecord | null> {
    const record = await this.prisma.roomFixture.findFirst({
      where: { leagueId, matchId: null },
      orderBy: { roundNumber: 'asc' },
    });
    if (record === null) {
      return null;
    }
    return {
      id: record.id,
      leagueId: record.leagueId,
      roundNumber: record.roundNumber,
      homeParticipantId: record.homeParticipantId,
      awayParticipantId: record.awayParticipantId,
      matchId: record.matchId,
      homeScore: null,
      awayScore: null,
      matchStatus: null,
    };
  }

  async createMatch(input: CreateMatchInput): Promise<RoomMatchRecord> {
    const matchId = randomUUID();

    await this.prisma.$transaction(async (tx) => {
      await tx.roomMatch.create({
        data: {
          id: matchId,
          leagueId: input.leagueId,
          homeParticipantId: input.homeParticipantId,
          awayParticipantId: input.awayParticipantId,
          status: 'SCHEDULED',
          currentMinute: 0,
          homeScore: 0,
          awayScore: 0,
          homeXg: input.homeXg,
          awayXg: input.awayXg,
          simulationSeed: input.simulationSeed,
          homeSnapshot: input.homeSnapshot as unknown as Prisma.InputJsonValue,
          awaySnapshot: input.awaySnapshot as unknown as Prisma.InputJsonValue,
          manOfTheMatchCardId: input.manOfTheMatchCardId,
        },
      });

      await tx.roomMatchStatistic.create({
        data: {
          id: randomUUID(),
          matchId,
          homePossession: input.statistics.homePossession,
          awayPossession: input.statistics.awayPossession,
          homeShots: input.statistics.homeShots,
          awayShots: input.statistics.awayShots,
          homeShotsOnTarget: input.statistics.homeShotsOnTarget,
          awayShotsOnTarget: input.statistics.awayShotsOnTarget,
          homeCorners: input.statistics.homeCorners,
          awayCorners: input.statistics.awayCorners,
          homeFouls: input.statistics.homeFouls,
          awayFouls: input.statistics.awayFouls,
          homeYellowCards: input.statistics.homeYellowCards,
          awayYellowCards: input.statistics.awayYellowCards,
          homeRedCards: input.statistics.homeRedCards,
          awayRedCards: input.statistics.awayRedCards,
          homeDangerousAttacks: input.statistics.homeDangerousAttacks,
          awayDangerousAttacks: input.statistics.awayDangerousAttacks,
          playerRatings: input.statistics.playerRatings,
        },
      });

      await tx.roomMatchEvent.createMany({
        data: input.events.map((event, index) => ({
          id: randomUUID(),
          matchId,
          minute: event.minute,
          eventType: event.eventType,
          teamSide: event.teamSide,
          playerName: event.playerName,
          secondaryPlayerName: event.secondaryPlayerName,
          cardId: event.cardId,
          commentary: event.commentary,
          xgValue: event.xgValue,
          isGoal: event.isGoal,
          sortOrder: index,
        })),
      });

      await tx.roomFixture.update({
        where: { id: input.fixtureId },
        data: { matchId },
      });
    });

    const created = await this.prisma.roomMatch.findUniqueOrThrow({ where: { id: matchId } });
    return this.toMatchRecord(created);
  }

  async listMatchEvents(
    matchId: string,
    revealedOnly: boolean,
  ): Promise<readonly RoomMatchEventRecord[]> {
    const records = await this.prisma.roomMatchEvent.findMany({
      where: {
        matchId,
        ...(revealedOnly ? { revealedAt: { not: null } } : {}),
      },
      orderBy: [{ minute: 'asc' }, { sortOrder: 'asc' }],
    });
    return records.map((record) => ({
      id: record.id,
      matchId: record.matchId,
      minute: record.minute,
      eventType: record.eventType,
      teamSide: record.teamSide,
      playerName: record.playerName,
      secondaryPlayerName: record.secondaryPlayerName,
      cardId: record.cardId,
      commentary: record.commentary,
      xgValue: record.xgValue,
      isGoal: record.isGoal,
      sortOrder: record.sortOrder,
      revealedAt: record.revealedAt,
    }));
  }

  async updateMatchProgress(input: {
    readonly matchId: string;
    readonly status: string;
    readonly currentMinute: number;
    readonly homeScore: number;
    readonly awayScore: number;
    readonly revealedEventIds: readonly string[];
  }): Promise<RoomMatchRecord> {
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.roomMatch.update({
        where: { id: input.matchId },
        data: {
          status: input.status,
          currentMinute: input.currentMinute,
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          ...(input.status === 'LIVE' ? { startedAt: now } : {}),
        },
      });

      if (input.revealedEventIds.length > 0) {
        await tx.roomMatchEvent.updateMany({
          where: { id: { in: [...input.revealedEventIds] }, revealedAt: null },
          data: { revealedAt: now },
        });
      }
    });

    return (await this.findMatchById(input.matchId))!;
  }

  async finalizeMatch(input: {
    readonly matchId: string;
    readonly homeScore: number;
    readonly awayScore: number;
    readonly homeParticipantId: string;
    readonly awayParticipantId: string;
  }): Promise<boolean> {
    const match = await this.prisma.roomMatch.findUniqueOrThrow({
      where: { id: input.matchId },
      select: { leagueId: true },
    });

    await this.prisma.roomMatch.update({
      where: { id: input.matchId },
      data: { status: 'FULL_TIME', currentMinute: 90, finishedAt: new Date() },
    });

    const homeStanding = await this.prisma.roomLeagueStanding.findFirst({
      where: { leagueId: match.leagueId, participantId: input.homeParticipantId },
    });
    const awayStanding = await this.prisma.roomLeagueStanding.findFirst({
      where: { leagueId: match.leagueId, participantId: input.awayParticipantId },
    });

    if (homeStanding === null || awayStanding === null) {
      return false;
    }

    const homeWon = input.homeScore > input.awayScore;
    const awayWon = input.awayScore > input.homeScore;
    const drawn = input.homeScore === input.awayScore;

    await this.prisma.$transaction(async (tx) => {
      await tx.roomLeagueStanding.update({
        where: { id: homeStanding.id },
        data: {
          played: homeStanding.played + 1,
          won: homeStanding.won + (homeWon ? 1 : 0),
          drawn: homeStanding.drawn + (drawn ? 1 : 0),
          lost: homeStanding.lost + (awayWon ? 1 : 0),
          goalsFor: homeStanding.goalsFor + input.homeScore,
          goalsAgainst: homeStanding.goalsAgainst + input.awayScore,
          goalDifference:
            homeStanding.goalsFor + input.homeScore - (homeStanding.goalsAgainst + input.awayScore),
          points: homeStanding.points + (homeWon ? 3 : drawn ? 1 : 0),
        },
      });

      await tx.roomLeagueStanding.update({
        where: { id: awayStanding.id },
        data: {
          played: awayStanding.played + 1,
          won: awayStanding.won + (awayWon ? 1 : 0),
          drawn: awayStanding.drawn + (drawn ? 1 : 0),
          lost: awayStanding.lost + (homeWon ? 1 : 0),
          goalsFor: awayStanding.goalsFor + input.awayScore,
          goalsAgainst: awayStanding.goalsAgainst + input.homeScore,
          goalDifference:
            awayStanding.goalsFor + input.awayScore - (awayStanding.goalsAgainst + input.homeScore),
          points: awayStanding.points + (awayWon ? 3 : drawn ? 1 : 0),
        },
      });
    });

    await this.recalculateRanks(match.leagueId);
    const remaining = await this.prisma.roomFixture.count({
      where: { leagueId: match.leagueId, matchId: null },
    });
    const leagueCompleted = remaining === 0;
    if (leagueCompleted) {
      await this.updateLeagueStatus(match.leagueId, 'COMPLETED');
    }

    return leagueCompleted;
  }

  async updateLeagueStatus(leagueId: string, status: string): Promise<void> {
    await this.prisma.roomLeague.update({ where: { id: leagueId }, data: { status } });
  }

  async countCompletedMatches(leagueId: string): Promise<number> {
    return this.prisma.roomMatch.count({
      where: { leagueId, status: 'FULL_TIME' },
    });
  }

  private async recalculateRanks(leagueId: string): Promise<void> {
    const standings = await this.prisma.roomLeagueStanding.findMany({
      where: { leagueId },
      orderBy: [{ points: 'desc' }, { goalDifference: 'desc' }, { goalsFor: 'desc' }],
    });

    await Promise.all(
      standings.map((standing, index) =>
        this.prisma.roomLeagueStanding.update({
          where: { id: standing.id },
          data: { rank: index + 1 },
        }),
      ),
    );
  }

  private toMatchRecord(record: {
    id: string;
    leagueId: string;
    homeParticipantId: string;
    awayParticipantId: string;
    status: string;
    currentMinute: number;
    homeScore: number;
    awayScore: number;
    homeXg: number;
    awayXg: number;
    simulationSeed: number;
    homeSnapshot: unknown;
    awaySnapshot: unknown;
    manOfTheMatchCardId: string | null;
    startedAt: Date | null;
    finishedAt: Date | null;
  }): RoomMatchRecord {
    return {
      id: record.id,
      leagueId: record.leagueId,
      homeParticipantId: record.homeParticipantId,
      awayParticipantId: record.awayParticipantId,
      status: record.status,
      currentMinute: record.currentMinute,
      homeScore: record.homeScore,
      awayScore: record.awayScore,
      homeXg: record.homeXg,
      awayXg: record.awayXg,
      simulationSeed: record.simulationSeed,
      homeSnapshot: record.homeSnapshot as MatchTeamSnapshot,
      awaySnapshot: record.awaySnapshot as MatchTeamSnapshot,
      manOfTheMatchCardId: record.manOfTheMatchCardId,
      startedAt: record.startedAt,
      finishedAt: record.finishedAt,
    };
  }
}
