import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';

import {
  ROOM_EVENTS_PUBLISHER,
  type RoomEventsPublisher,
} from '../../../lobbies/application/services/room-events.publisher';
import { RoomEventName } from '../../../lobbies/domain/events/room.events';
import { DEFAULT_MATCH_SIMULATION_CONFIG } from '../../../simulation/domain/models/match-simulation.types';
import type { RoomMatchEventRecord } from '../../domain/repositories/room-league.repository';
import {
  ROOM_LEAGUE_REPOSITORY,
  type RoomLeagueRepository,
} from '../../domain/repositories/room-league.repository';

interface ActivePlayback {
  readonly matchId: string;
  readonly leagueId: string;
  readonly lobbyCode: string;
  readonly timer: ReturnType<typeof setInterval>;
}

const ALERT_EVENT_TYPES = new Set(['GOAL_CHANCE', 'PENALTY']);
const ALERT_REVEAL_DELAY_MS = 3000;

@Injectable()
export class MatchPlaybackService implements OnModuleDestroy {
  private readonly active = new Map<string, ActivePlayback>();
  private readonly pendingReveals = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(
    @Inject(ROOM_LEAGUE_REPOSITORY)
    private readonly roomLeagueRepository: RoomLeagueRepository,
    @Inject(ROOM_EVENTS_PUBLISHER)
    private readonly roomEventsPublisher: RoomEventsPublisher,
  ) {}

  onModuleDestroy(): void {
    for (const playback of this.active.values()) {
      clearInterval(playback.timer);
    }
    for (const timer of this.pendingReveals.values()) {
      clearTimeout(timer);
    }
    this.active.clear();
    this.pendingReveals.clear();
  }

  async startPlayback(input: {
    readonly matchId: string;
    readonly leagueId: string;
    readonly lobbyCode: string;
  }): Promise<void> {
    if (this.active.has(input.matchId)) {
      return;
    }

    await this.roomLeagueRepository.updateLeagueStatus(input.leagueId, 'IN_PROGRESS');
    await this.roomLeagueRepository.updateMatchProgress({
      matchId: input.matchId,
      status: 'LIVE',
      currentMinute: 0,
      homeScore: 0,
      awayScore: 0,
      revealedEventIds: [],
    });

    this.roomEventsPublisher.publish(input.lobbyCode, RoomEventName.MATCH_STARTED, {
      lobbyCode: input.lobbyCode,
      phase: 'MATCHES',
      matchId: input.matchId,
    });

    const timer = setInterval(() => {
      void this.tick(input.matchId, input.leagueId, input.lobbyCode);
    }, DEFAULT_MATCH_SIMULATION_CONFIG.msPerMinute);

    this.active.set(input.matchId, {
      matchId: input.matchId,
      leagueId: input.leagueId,
      lobbyCode: input.lobbyCode,
      timer,
    });
  }

  private async tick(matchId: string, leagueId: string, lobbyCode: string): Promise<void> {
    if (this.pendingReveals.has(matchId)) {
      return;
    }

    const match = await this.roomLeagueRepository.findMatchById(matchId);
    if (match === null || match.status === 'FULL_TIME') {
      this.stop(matchId);
      return;
    }

    const nextMinute = match.currentMinute + 1;
    const allEvents = await this.roomLeagueRepository.listMatchEvents(matchId, false);
    const minuteEvents = allEvents
      .filter((event) => event.minute === nextMinute && event.revealedAt === null)
      .sort((left, right) => left.sortOrder - right.sortOrder);

    let status = 'LIVE';
    if (nextMinute === 45) {
      status = 'HALF_TIME';
    } else if (match.status === 'HALF_TIME' && nextMinute > 45) {
      status = 'LIVE';
    }

    const alertEvents = minuteEvents.filter((event) => ALERT_EVENT_TYPES.has(event.eventType));
    const resolutionEvents = minuteEvents.filter(
      (event) => !ALERT_EVENT_TYPES.has(event.eventType),
    );

    if (alertEvents.length > 0 && resolutionEvents.length > 0) {
      const statusWhilePending = nextMinute >= 90 ? 'LIVE' : status;

      await this.revealEvents({
        matchId,
        leagueId,
        lobbyCode,
        match,
        nextMinute,
        status: statusWhilePending,
        eventsToReveal: alertEvents,
        allEvents,
      });

      const timer = setTimeout(() => {
        void this.revealDelayedEvents(matchId, leagueId, lobbyCode, resolutionEvents);
      }, ALERT_REVEAL_DELAY_MS);
      this.pendingReveals.set(matchId, timer);
      return;
    }

    const updated = await this.revealEvents({
      matchId,
      leagueId,
      lobbyCode,
      match,
      nextMinute,
      status,
      eventsToReveal: minuteEvents,
      allEvents,
    });

    await this.handleMinuteMilestones(matchId, leagueId, lobbyCode, match, nextMinute, updated);
  }

  private async revealDelayedEvents(
    matchId: string,
    leagueId: string,
    lobbyCode: string,
    eventsToReveal: readonly RoomMatchEventRecord[],
  ): Promise<void> {
    this.pendingReveals.delete(matchId);

    const match = await this.roomLeagueRepository.findMatchById(matchId);
    if (match === null || eventsToReveal.length === 0) {
      return;
    }

    const allEvents = await this.roomLeagueRepository.listMatchEvents(matchId, false);
    const updated = await this.revealEvents({
      matchId,
      leagueId,
      lobbyCode,
      match,
      nextMinute: match.currentMinute,
      status: match.status,
      eventsToReveal,
      allEvents,
      advanceMinute: false,
    });

    if (updated.currentMinute >= 90) {
      await this.handleMinuteMilestones(matchId, leagueId, lobbyCode, match, 90, updated);
    }
  }

  private async revealEvents(input: {
    readonly matchId: string;
    readonly leagueId: string;
    readonly lobbyCode: string;
    readonly match: NonNullable<Awaited<ReturnType<RoomLeagueRepository['findMatchById']>>>;
    readonly nextMinute: number;
    readonly status: string;
    readonly eventsToReveal: readonly RoomMatchEventRecord[];
    readonly allEvents: readonly RoomMatchEventRecord[];
    readonly advanceMinute?: boolean;
  }): Promise<NonNullable<Awaited<ReturnType<RoomLeagueRepository['findMatchById']>>>> {
    const advanceMinute = input.advanceMinute ?? true;
    const alreadyRevealed = input.allEvents.filter((event) => event.revealedAt !== null);
    const revealedNow = [...alreadyRevealed, ...input.eventsToReveal];
    const homeScore = revealedNow.filter(
      (event) => event.isGoal && event.teamSide === 'HOME',
    ).length;
    const awayScore = revealedNow.filter(
      (event) => event.isGoal && event.teamSide === 'AWAY',
    ).length;

    const updated = await this.roomLeagueRepository.updateMatchProgress({
      matchId: input.matchId,
      status: advanceMinute && input.nextMinute >= 90 ? 'FULL_TIME' : input.status,
      currentMinute: advanceMinute ? Math.min(input.nextMinute, 90) : input.match.currentMinute,
      homeScore,
      awayScore,
      revealedEventIds: input.eventsToReveal.map((event) => event.id),
    });

    if (advanceMinute) {
      this.roomEventsPublisher.publish(input.lobbyCode, RoomEventName.MATCH_MINUTE_UPDATED, {
        lobbyCode: input.lobbyCode,
        phase: 'MATCHES',
        matchId: input.matchId,
        currentMinute: updated.currentMinute,
        homeScore: updated.homeScore,
        awayScore: updated.awayScore,
      });
    }

    for (const event of input.eventsToReveal) {
      this.roomEventsPublisher.publish(input.lobbyCode, RoomEventName.MATCH_EVENT_CREATED, {
        lobbyCode: input.lobbyCode,
        phase: 'MATCHES',
        matchId: input.matchId,
        eventId: event.id,
        eventType: event.eventType,
        commentary: event.commentary,
      });
      if (event.isGoal) {
        this.roomEventsPublisher.publish(input.lobbyCode, RoomEventName.GOAL_SCORED, {
          lobbyCode: input.lobbyCode,
          phase: 'MATCHES',
          matchId: input.matchId,
          ...(event.playerName !== null ? { playerName: event.playerName } : {}),
        });
      }
    }

    if (advanceMinute) {
      await this.handleMinuteMilestones(
        input.matchId,
        input.leagueId,
        input.lobbyCode,
        input.match,
        input.nextMinute,
        updated,
      );
    }

    return updated;
  }

  private async handleMinuteMilestones(
    matchId: string,
    _leagueId: string,
    lobbyCode: string,
    match: NonNullable<Awaited<ReturnType<RoomLeagueRepository['findMatchById']>>>,
    nextMinute: number,
    updated: NonNullable<Awaited<ReturnType<RoomLeagueRepository['findMatchById']>>>,
  ): Promise<void> {
    if (nextMinute === 45) {
      this.roomEventsPublisher.publish(lobbyCode, RoomEventName.HALF_TIME, {
        lobbyCode,
        phase: 'MATCHES',
        matchId,
      });
      return;
    }

    if (nextMinute >= 90) {
      await this.roomLeagueRepository.finalizeMatch({
        matchId,
        homeScore: updated.homeScore,
        awayScore: updated.awayScore,
        homeParticipantId: match.homeParticipantId,
        awayParticipantId: match.awayParticipantId,
      });

      this.roomEventsPublisher.publish(lobbyCode, RoomEventName.FULL_TIME, {
        lobbyCode,
        phase: 'MATCHES',
        matchId,
      });
      this.roomEventsPublisher.publish(lobbyCode, RoomEventName.LEAGUE_TABLE_UPDATED, {
        lobbyCode,
        phase: 'MATCHES',
      });

      this.stop(matchId);
    }
  }

  private stop(matchId: string): void {
    const pending = this.pendingReveals.get(matchId);
    if (pending !== undefined) {
      clearTimeout(pending);
      this.pendingReveals.delete(matchId);
    }

    const playback = this.active.get(matchId);
    if (playback === undefined) {
      return;
    }
    clearInterval(playback.timer);
    this.active.delete(matchId);
  }
}
