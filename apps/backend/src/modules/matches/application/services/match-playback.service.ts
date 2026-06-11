import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

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
import {
  eventsForInternalMinute,
  resolveMatchStoppageContext,
} from '../../domain/services/match-stoppage-time.service';
import type { MatchPlaybackPort } from '../ports/match-playback.port';

interface ActivePlayback {
  readonly matchId: string;
  readonly leagueId: string;
  readonly lobbyCode: string;
  timer: ReturnType<typeof setInterval> | null;
  warmupTimer: ReturnType<typeof setTimeout> | null;
  halfTimeResumeTimer: ReturnType<typeof setTimeout> | null;
}

type MatchRecord = NonNullable<Awaited<ReturnType<RoomLeagueRepository['findMatchById']>>>;
type MatchMilestones = ReturnType<typeof resolveMatchStoppageContext>['milestones'];

const ALERT_EVENT_TYPES = new Set(['GOAL_CHANCE', 'PENALTY']);
const ALERT_REVEAL_DELAY_MS = 1500;
const LIVE_MATCH_STATUSES = new Set(['PRE_MATCH', 'LIVE', 'HALF_TIME', 'PAUSED']);

function dedupeMatchEvents(
  events: readonly RoomMatchEventRecord[],
): readonly RoomMatchEventRecord[] {
  const seen = new Set<string>();
  const unique: RoomMatchEventRecord[] = [];

  for (const event of events) {
    if (seen.has(event.id)) {
      continue;
    }
    seen.add(event.id);
    unique.push(event);
  }

  return unique;
}

function countScoredGoals(
  events: readonly RoomMatchEventRecord[],
  teamSide: 'HOME' | 'AWAY',
): number {
  return events.filter(
    (event) => event.isGoal && event.eventType === 'GOAL' && event.teamSide === teamSide,
  ).length;
}

@Injectable()
export class MatchPlaybackService implements MatchPlaybackPort, OnModuleDestroy {
  private readonly active = new Map<string, ActivePlayback>();
  private readonly pendingReveals = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly processingTicks = new Set<string>();
  private readonly autoStartTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(
    @Inject(ROOM_LEAGUE_REPOSITORY)
    private readonly roomLeagueRepository: RoomLeagueRepository,
    @Inject(ROOM_EVENTS_PUBLISHER)
    private readonly roomEventsPublisher: RoomEventsPublisher,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleDestroy(): void {
    for (const playback of this.active.values()) {
      if (playback.timer !== null) {
        clearInterval(playback.timer);
      }
      if (playback.warmupTimer !== null) {
        clearTimeout(playback.warmupTimer);
      }
      if (playback.halfTimeResumeTimer !== null) {
        clearTimeout(playback.halfTimeResumeTimer);
      }
    }
    for (const timer of this.pendingReveals.values()) {
      clearTimeout(timer);
    }
    for (const timer of this.autoStartTimers.values()) {
      clearTimeout(timer);
    }
    this.active.clear();
    this.pendingReveals.clear();
    this.processingTicks.clear();
    this.autoStartTimers.clear();
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
      status: 'PRE_MATCH',
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

    const warmupTimer = setTimeout(() => {
      void this.beginLivePlayback(input.matchId, input.leagueId, input.lobbyCode);
    }, DEFAULT_MATCH_SIMULATION_CONFIG.warmupDelayMs);

    this.active.set(input.matchId, {
      matchId: input.matchId,
      leagueId: input.leagueId,
      lobbyCode: input.lobbyCode,
      timer: null,
      warmupTimer,
      halfTimeResumeTimer: null,
    });
  }

  async ensurePlaybackRunning(input: {
    readonly matchId: string;
    readonly leagueId: string;
    readonly lobbyCode: string;
    readonly status: string;
  }): Promise<void> {
    if (!LIVE_MATCH_STATUSES.has(input.status)) {
      return;
    }

    const match = await this.roomLeagueRepository.findMatchById(input.matchId);
    if (match === null || match.status === 'FULL_TIME') {
      return;
    }

    const { milestones } = resolveMatchStoppageContext(match.simulationSeed);
    if (match.currentMinute >= milestones.matchEnd) {
      await this.finalizeMatchIfNeeded(input.lobbyCode, match, milestones);
      this.stop(input.matchId);
      return;
    }

    const playback = this.active.get(input.matchId);
    if (playback !== undefined) {
      if (
        match.status === 'HALF_TIME' &&
        playback.timer === null &&
        playback.halfTimeResumeTimer === null
      ) {
        void this.resumeAfterHalfTime(input.matchId, input.leagueId, input.lobbyCode);
      } else if (
        match.status === 'LIVE' &&
        playback.timer === null &&
        playback.halfTimeResumeTimer === null
      ) {
        this.startMatchTimer(input.matchId, input.leagueId, input.lobbyCode);
      }
      return;
    }

    await this.recoverOrphanedPlayback(input.matchId, input.leagueId, input.lobbyCode, match);
  }

  private async recoverOrphanedPlayback(
    matchId: string,
    leagueId: string,
    lobbyCode: string,
    match: MatchRecord,
  ): Promise<void> {
    if (this.active.has(matchId)) {
      return;
    }

    this.active.set(matchId, {
      matchId,
      leagueId,
      lobbyCode,
      timer: null,
      warmupTimer: null,
      halfTimeResumeTimer: null,
    });

    if (match.status === 'PRE_MATCH') {
      const warmupTimer = setTimeout(() => {
        void this.beginLivePlayback(matchId, leagueId, lobbyCode);
      }, DEFAULT_MATCH_SIMULATION_CONFIG.warmupDelayMs);
      const playback = this.active.get(matchId);
      if (playback !== undefined) {
        playback.warmupTimer = warmupTimer;
      }
      return;
    }

    if (match.status === 'HALF_TIME') {
      void this.resumeAfterHalfTime(matchId, leagueId, lobbyCode);
      return;
    }

    this.startMatchTimer(matchId, leagueId, lobbyCode);
  }

  private startMatchTimer(matchId: string, leagueId: string, lobbyCode: string): void {
    const playback = this.active.get(matchId);
    if (playback === undefined || playback.timer !== null) {
      return;
    }

    playback.timer = setInterval(() => {
      void this.tick(matchId, leagueId, lobbyCode);
    }, DEFAULT_MATCH_SIMULATION_CONFIG.msPerMinute);
  }

  private async beginLivePlayback(
    matchId: string,
    leagueId: string,
    lobbyCode: string,
  ): Promise<void> {
    const playback = this.active.get(matchId);
    if (playback === undefined) {
      return;
    }

    playback.warmupTimer = null;

    const match = await this.roomLeagueRepository.findMatchById(matchId);
    if (match === null || match.status === 'FULL_TIME') {
      this.stop(matchId);
      return;
    }

    await this.roomLeagueRepository.updateMatchProgress({
      matchId,
      status: 'LIVE',
      currentMinute: 0,
      homeScore: 0,
      awayScore: 0,
      revealedEventIds: [],
    });

    this.roomEventsPublisher.publish(lobbyCode, RoomEventName.MATCH_MINUTE_UPDATED, {
      lobbyCode,
      phase: 'MATCHES',
      matchId,
      currentMinute: 0,
      homeScore: 0,
      awayScore: 0,
    });

    this.startMatchTimer(matchId, leagueId, lobbyCode);
  }

  private async tick(matchId: string, leagueId: string, lobbyCode: string): Promise<void> {
    if (this.pendingReveals.has(matchId) || this.processingTicks.has(matchId)) {
      return;
    }

    const playback = this.active.get(matchId);
    if (playback?.halfTimeResumeTimer !== null) {
      return;
    }

    this.processingTicks.add(matchId);

    try {
      const match = await this.roomLeagueRepository.findMatchById(matchId);
      if (match === null || match.status === 'FULL_TIME') {
        this.stop(matchId);
        return;
      }

      const { stoppage, milestones } = resolveMatchStoppageContext(match.simulationSeed);

      if (match.currentMinute >= milestones.matchEnd) {
        await this.finalizeMatchIfNeeded(lobbyCode, match, milestones);
        this.stop(matchId);
        return;
      }

      if (match.status === 'HALF_TIME') {
        if (
          playback !== undefined &&
          playback.timer === null &&
          playback.halfTimeResumeTimer === null
        ) {
          void this.resumeAfterHalfTime(matchId, leagueId, lobbyCode);
        }
        return;
      }

      const nextMinute = match.currentMinute + 1;
      if (nextMinute > milestones.matchEnd) {
        await this.finalizeMatchIfNeeded(lobbyCode, match, milestones);
        this.stop(matchId);
        return;
      }

      const allEvents = await this.roomLeagueRepository.listMatchEvents(matchId, false);
      const minuteEvents = eventsForInternalMinute(allEvents, nextMinute, stoppage);

      let status = 'LIVE';
      if (nextMinute === milestones.firstHalfEnd) {
        status = 'HALF_TIME';
      }

      const alertEvents = minuteEvents.filter((event) => ALERT_EVENT_TYPES.has(event.eventType));
      const resolutionEvents = minuteEvents.filter(
        (event) => !ALERT_EVENT_TYPES.has(event.eventType),
      );
      const shouldDelayAlertReveal =
        alertEvents.length > 0 && resolutionEvents.length > 0 && nextMinute < milestones.matchEnd;

      if (shouldDelayAlertReveal) {
        const updated = await this.revealEvents({
          matchId,
          leagueId,
          lobbyCode,
          match,
          nextMinute,
          status,
          eventsToReveal: alertEvents,
          allEvents,
          milestones,
        });

        const timer = setTimeout(() => {
          void this.revealDelayedEvents(matchId, leagueId, lobbyCode, resolutionEvents);
        }, ALERT_REVEAL_DELAY_MS);
        this.pendingReveals.set(matchId, timer);

        await this.handleMinuteMilestones(
          matchId,
          leagueId,
          lobbyCode,
          match,
          nextMinute,
          updated,
          milestones,
        );
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
        milestones,
      });

      await this.handleMinuteMilestones(
        matchId,
        leagueId,
        lobbyCode,
        match,
        nextMinute,
        updated,
        milestones,
      );
    } finally {
      this.processingTicks.delete(matchId);
    }
  }

  private async revealDelayedEvents(
    matchId: string,
    leagueId: string,
    lobbyCode: string,
    eventsToReveal: readonly RoomMatchEventRecord[],
  ): Promise<void> {
    if (this.processingTicks.has(matchId)) {
      const timer = setTimeout(() => {
        void this.revealDelayedEvents(matchId, leagueId, lobbyCode, eventsToReveal);
      }, 250);
      this.pendingReveals.set(matchId, timer);
      return;
    }

    this.pendingReveals.delete(matchId);
    this.processingTicks.add(matchId);

    try {
      const match = await this.roomLeagueRepository.findMatchById(matchId);
      if (match === null || eventsToReveal.length === 0 || match.status === 'FULL_TIME') {
        return;
      }

      const { milestones } = resolveMatchStoppageContext(match.simulationSeed);
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
        milestones,
      });

      await this.handleMinuteMilestones(
        matchId,
        leagueId,
        lobbyCode,
        match,
        updated.currentMinute,
        updated,
        milestones,
      );
    } finally {
      this.processingTicks.delete(matchId);
    }
  }

  private async revealEvents(input: {
    readonly matchId: string;
    readonly leagueId: string;
    readonly lobbyCode: string;
    readonly match: MatchRecord;
    readonly nextMinute: number;
    readonly status: string;
    readonly eventsToReveal: readonly RoomMatchEventRecord[];
    readonly allEvents: readonly RoomMatchEventRecord[];
    readonly advanceMinute?: boolean;
    readonly milestones: MatchMilestones;
  }): Promise<MatchRecord> {
    const advanceMinute = input.advanceMinute ?? true;
    const alreadyRevealed = input.allEvents.filter((event) => event.revealedAt !== null);
    const revealedNow = dedupeMatchEvents([...alreadyRevealed, ...input.eventsToReveal]);
    const homeScore = countScoredGoals(revealedNow, 'HOME');
    const awayScore = countScoredGoals(revealedNow, 'AWAY');

    const updated = await this.roomLeagueRepository.updateMatchProgress({
      matchId: input.matchId,
      status: input.status,
      currentMinute: advanceMinute
        ? Math.min(input.nextMinute, input.milestones.matchEnd)
        : input.match.currentMinute,
      homeScore,
      awayScore,
      revealedEventIds: input.eventsToReveal.map((event) => event.id),
    });

    const scoreChanged =
      updated.homeScore !== input.match.homeScore || updated.awayScore !== input.match.awayScore;

    if (advanceMinute || scoreChanged) {
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
      const visualization = readEventVisualization(event.visualization);
      this.roomEventsPublisher.publish(input.lobbyCode, RoomEventName.MATCH_EVENT_CREATED, {
        lobbyCode: input.lobbyCode,
        phase: 'MATCHES',
        matchId: input.matchId,
        eventId: event.id,
        eventType: event.eventType,
        commentary: event.commentary,
        ...(visualization !== null
          ? {
              ballZone: visualization.ballZone,
              ...(visualization.previousBallZone !== null
                ? { previousBallZone: visualization.previousBallZone }
                : {}),
              homeMomentum: visualization.homeMomentum,
              awayMomentum: visualization.awayMomentum,
              ...(visualization.attackChainId !== null
                ? { attackChainId: visualization.attackChainId }
                : {}),
            }
          : {}),
      });

      if (visualization !== null) {
        this.roomEventsPublisher.publish(input.lobbyCode, RoomEventName.BALL_MOVED, {
          lobbyCode: input.lobbyCode,
          phase: 'MATCHES',
          matchId: input.matchId,
          ballZone: visualization.ballZone,
          ...(visualization.previousBallZone !== null
            ? { previousBallZone: visualization.previousBallZone }
            : {}),
        });

        if (visualization.attackPhase === 'START') {
          this.roomEventsPublisher.publish(input.lobbyCode, RoomEventName.ATTACK_STARTED, {
            lobbyCode: input.lobbyCode,
            phase: 'MATCHES',
            matchId: input.matchId,
            ...(visualization.attackChainId !== null
              ? { attackChainId: visualization.attackChainId }
              : {}),
          });
        } else if (visualization.attackPhase === 'PROGRESS') {
          this.roomEventsPublisher.publish(input.lobbyCode, RoomEventName.ATTACK_PROGRESS, {
            lobbyCode: input.lobbyCode,
            phase: 'MATCHES',
            matchId: input.matchId,
            ...(visualization.attackChainId !== null
              ? { attackChainId: visualization.attackChainId }
              : {}),
          });
        }

        this.roomEventsPublisher.publish(input.lobbyCode, RoomEventName.MOMENTUM_CHANGED, {
          lobbyCode: input.lobbyCode,
          phase: 'MATCHES',
          matchId: input.matchId,
          homeMomentum: visualization.homeMomentum,
          awayMomentum: visualization.awayMomentum,
        });
      }

      if (event.eventType === 'SHOT' || event.eventType === 'SHOT_ON_TARGET') {
        this.roomEventsPublisher.publish(input.lobbyCode, RoomEventName.SHOT, {
          lobbyCode: input.lobbyCode,
          phase: 'MATCHES',
          matchId: input.matchId,
          eventId: event.id,
          eventType: event.eventType,
        });
      }

      if (event.isGoal) {
        this.roomEventsPublisher.publish(input.lobbyCode, RoomEventName.GOAL, {
          lobbyCode: input.lobbyCode,
          phase: 'MATCHES',
          matchId: input.matchId,
          ...(event.playerName !== null ? { playerName: event.playerName } : {}),
        });
        this.roomEventsPublisher.publish(input.lobbyCode, RoomEventName.GOAL_SCORED, {
          lobbyCode: input.lobbyCode,
          phase: 'MATCHES',
          matchId: input.matchId,
          ...(event.playerName !== null ? { playerName: event.playerName } : {}),
        });
      }
    }

    return updated;
  }

  private async handleMinuteMilestones(
    matchId: string,
    _leagueId: string,
    lobbyCode: string,
    match: MatchRecord,
    nextMinute: number,
    updated: MatchRecord,
    milestones: MatchMilestones,
  ): Promise<void> {
    if (nextMinute === milestones.firstHalfEnd) {
      const playback = this.active.get(matchId);
      const shouldPause = playback !== undefined && playback.timer !== null;

      if (shouldPause) {
        this.roomEventsPublisher.publish(lobbyCode, RoomEventName.HALF_TIME, {
          lobbyCode,
          phase: 'MATCHES',
          matchId,
        });
        this.pauseAtHalfTime(matchId, lobbyCode);
      }
      return;
    }

    if (nextMinute >= milestones.matchEnd) {
      await this.finalizeMatchIfNeeded(lobbyCode, match, milestones, updated);
      this.stop(matchId);
    }
  }

  private async finalizeMatchIfNeeded(
    lobbyCode: string,
    match: MatchRecord,
    milestones: MatchMilestones,
    updated: MatchRecord | null = null,
  ): Promise<void> {
    const latest = await this.roomLeagueRepository.findMatchById(match.id);
    if (latest === null || latest.status === 'FULL_TIME') {
      return;
    }

    if (
      updated === null &&
      latest.currentMinute < milestones.matchEnd &&
      latest.status === 'LIVE'
    ) {
      return;
    }

    const snapshot = updated ?? latest;
    const leagueCompleted = await this.roomLeagueRepository.finalizeMatch({
      matchId: match.id,
      homeScore: snapshot.homeScore,
      awayScore: snapshot.awayScore,
      homeParticipantId: match.homeParticipantId,
      awayParticipantId: match.awayParticipantId,
    });

    this.roomEventsPublisher.publish(lobbyCode, RoomEventName.FULL_TIME, {
      lobbyCode,
      phase: 'MATCHES',
      matchId: match.id,
    });
    this.roomEventsPublisher.publish(lobbyCode, RoomEventName.MATCH_FINISHED, {
      lobbyCode,
      phase: 'MATCHES',
      matchId: match.id,
    });
    this.roomEventsPublisher.publish(lobbyCode, RoomEventName.LEAGUE_TABLE_UPDATED, {
      lobbyCode,
      phase: 'MATCHES',
    });

    if (leagueCompleted) {
      const standings = await this.roomLeagueRepository.listStandings(match.leagueId);
      const winner = standings.find((row) => row.rank === 1);
      this.roomEventsPublisher.publish(lobbyCode, RoomEventName.LEAGUE_COMPLETED, {
        lobbyCode,
        phase: 'MATCHES',
        ...(winner !== undefined
          ? {
              winnerDisplayName: winner.displayName,
              winnerParticipantId: winner.participantId,
            }
          : {}),
      });
    } else {
      this.queueNextMatch(lobbyCode, match.id);
    }
  }

  private pauseAtHalfTime(matchId: string, lobbyCode: string): void {
    const playback = this.active.get(matchId);
    if (playback === undefined) {
      return;
    }

    if (playback.timer !== null) {
      clearInterval(playback.timer);
      playback.timer = null;
    }

    if (playback.halfTimeResumeTimer !== null) {
      clearTimeout(playback.halfTimeResumeTimer);
    }

    playback.halfTimeResumeTimer = setTimeout(() => {
      void this.resumeAfterHalfTime(matchId, playback.leagueId, lobbyCode);
    }, DEFAULT_MATCH_SIMULATION_CONFIG.halfTimeDelayMs);
  }

  private async resumeAfterHalfTime(
    matchId: string,
    leagueId: string,
    lobbyCode: string,
  ): Promise<void> {
    const playback = this.active.get(matchId);
    if (playback === undefined) {
      return;
    }

    playback.halfTimeResumeTimer = null;

    if (this.pendingReveals.has(matchId) || this.processingTicks.has(matchId)) {
      playback.halfTimeResumeTimer = setTimeout(() => {
        void this.resumeAfterHalfTime(matchId, leagueId, lobbyCode);
      }, 500);
      return;
    }

    const match = await this.roomLeagueRepository.findMatchById(matchId);
    if (match === null || match.status === 'FULL_TIME') {
      this.stop(matchId);
      return;
    }

    const updated = await this.roomLeagueRepository.updateMatchProgress({
      matchId,
      status: 'LIVE',
      currentMinute: match.currentMinute,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      revealedEventIds: [],
    });

    this.roomEventsPublisher.publish(lobbyCode, RoomEventName.MATCH_MINUTE_UPDATED, {
      lobbyCode,
      phase: 'MATCHES',
      matchId,
      currentMinute: updated.currentMinute,
      homeScore: updated.homeScore,
      awayScore: updated.awayScore,
    });

    this.startMatchTimer(matchId, leagueId, lobbyCode);
  }

  private queueNextMatch(lobbyCode: string, matchId: string): void {
    const existing = this.autoStartTimers.get(matchId);
    if (existing !== undefined) {
      clearTimeout(existing);
    }

    const timer = setTimeout(() => {
      this.autoStartTimers.delete(matchId);
      void import('../use-cases/start-next-match.use-case').then(({ StartNextMatchUseCase }) => {
        const startNextMatch = this.moduleRef.get(StartNextMatchUseCase, { strict: false });
        void startNextMatch?.execute({ code: lobbyCode });
      });
    }, DEFAULT_MATCH_SIMULATION_CONFIG.nextMatchDelayMs);

    this.autoStartTimers.set(matchId, timer);
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
    if (playback.timer !== null) {
      clearInterval(playback.timer);
    }
    if (playback.warmupTimer !== null) {
      clearTimeout(playback.warmupTimer);
    }
    if (playback.halfTimeResumeTimer !== null) {
      clearTimeout(playback.halfTimeResumeTimer);
    }
    this.active.delete(matchId);
  }
}

function readEventVisualization(visualization: RoomMatchEventRecord['visualization']): {
  readonly ballZone: string;
  readonly previousBallZone: string | null;
  readonly homeMomentum: number;
  readonly awayMomentum: number;
  readonly attackChainId: string | null;
  readonly attackPhase: string | null;
} | null {
  if (visualization === null) {
    return null;
  }

  const ballZone = visualization.ballZone;
  if (typeof ballZone !== 'string') {
    return null;
  }

  return {
    ballZone,
    previousBallZone:
      typeof visualization.previousBallZone === 'string' ? visualization.previousBallZone : null,
    homeMomentum: typeof visualization.homeMomentum === 'number' ? visualization.homeMomentum : 0.5,
    awayMomentum: typeof visualization.awayMomentum === 'number' ? visualization.awayMomentum : 0.5,
    attackChainId:
      typeof visualization.attackChainId === 'string' ? visualization.attackChainId : null,
    attackPhase: typeof visualization.attackPhase === 'string' ? visualization.attackPhase : null,
  };
}
