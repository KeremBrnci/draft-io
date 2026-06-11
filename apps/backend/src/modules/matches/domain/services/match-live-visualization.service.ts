import type {
  MatchAttackChainDto,
  MatchEventVisualizationDto,
  MatchLiveVisualizationDto,
  MatchReplaySnapshotDto,
  PitchZoneDto,
} from '@draft-io/shared-types';

import type { RoomMatchEventRecord } from '../repositories/room-league.repository';

import { MatchMomentumTracker, toMomentumPercent } from './match-momentum.service';

export function toEventVisualizationDto(
  visualization: Record<string, unknown> | null,
  teamSide = 'NEUTRAL',
): MatchEventVisualizationDto | null {
  if (visualization === null) {
    return null;
  }

  const ballZone = visualization.ballZone;
  if (typeof ballZone !== 'string') {
    return null;
  }

  const activePlayerCardIds = readStringArray(visualization.activePlayerCardIds);
  const activePlayerNames = readStringArray(visualization.activePlayerNames);

  return {
    ballZone: ballZone as PitchZoneDto,
    previousBallZone: readNullableZone(visualization.previousBallZone),
    activePlayers: activePlayerNames.map((name, index) => ({
      cardId: activePlayerCardIds[index] ?? null,
      displayName: name,
      teamSide: teamSide as MatchEventVisualizationDto['activePlayers'][number]['teamSide'],
    })),
    attackChainId: readNullableString(visualization.attackChainId),
    attackChainStep: readNullableNumber(visualization.attackChainStep),
    attackChainPlayers: readNullableStringArray(visualization.attackChainPlayers),
    attackPhase: readAttackPhase(visualization.attackPhase),
    attackResult: readAttackResult(visualization.attackResult),
    homeMomentum: readNumber(visualization.homeMomentum, 0.5),
    awayMomentum: readNumber(visualization.awayMomentum, 0.5),
    isReplayEligible: visualization.isReplayEligible === true,
  };
}

export function resolveLiveVisualization(
  events: readonly RoomMatchEventRecord[],
  currentMinute: number,
): MatchLiveVisualizationDto | null {
  const revealed = events.filter((event) => event.revealedAt !== null);
  if (revealed.length === 0) {
    return null;
  }

  const latest = revealed[revealed.length - 1]!;
  const visualization = toEventVisualizationDto(latest.visualization);
  if (visualization === null) {
    return null;
  }

  const momentumTracker = new MatchMomentumTracker();
  for (const event of revealed) {
    momentumTracker.applyEvent({
      eventType: event.eventType,
      teamSide: event.teamSide as 'HOME' | 'AWAY' | 'NEUTRAL',
    });
  }

  const snapshot = momentumTracker.snapshot(currentMinute);
  const trend = momentumTracker.trend(currentMinute);
  const percents = toMomentumPercent(snapshot);

  const attackChain = buildAttackChain(latest, visualization);
  const activePlayers = visualization.activePlayers.map((player) => ({
    ...player,
    teamSide: latest.teamSide as 'HOME' | 'AWAY' | 'NEUTRAL',
  }));

  return {
    ballZone: visualization.ballZone,
    previousBallZone: visualization.previousBallZone,
    activePlayers,
    attackChain,
    momentum: {
      home: percents.home,
      away: percents.away,
      homeTrend: Math.round(trend.homeTrend * 100),
      awayTrend: Math.round(trend.awayTrend * 100),
    },
    lastEventType: latest.eventType as MatchLiveVisualizationDto['lastEventType'],
    highlightGoal: latest.eventType === 'GOAL',
  };
}

export function buildReplaySnapshots(
  events: readonly RoomMatchEventRecord[],
): readonly MatchReplaySnapshotDto[] {
  return events.flatMap((event) => {
    const visualization = toEventVisualizationDto(event.visualization, event.teamSide);
    if (visualization === null || !visualization.isReplayEligible) {
      return [];
    }

    return [
      {
        eventId: event.id,
        minute: event.minute,
        eventType: event.eventType as MatchReplaySnapshotDto['eventType'],
        teamSide: event.teamSide as MatchReplaySnapshotDto['teamSide'],
        playerName: event.playerName,
        secondaryPlayerName: event.secondaryPlayerName,
        attackChainPlayers: visualization.attackChainPlayers,
        visualization,
      },
    ];
  });
}

function buildAttackChain(
  event: RoomMatchEventRecord,
  visualization: MatchEventVisualizationDto,
): MatchAttackChainDto | null {
  if (visualization.attackChainId === null || visualization.attackChainPlayers === null) {
    return null;
  }

  return {
    id: visualization.attackChainId,
    teamSide: event.teamSide as MatchAttackChainDto['teamSide'],
    players: visualization.attackChainPlayers,
    result: visualization.attackResult,
  };
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === 'string');
}

function readNullableStringArray(value: unknown): readonly string[] | null {
  const items = readStringArray(value);
  return items.length === 0 ? null : items;
}

function readNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function readNullableNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

function readNullableZone(value: unknown): PitchZoneDto | null {
  return typeof value === 'string' ? (value as PitchZoneDto) : null;
}

function readAttackPhase(value: unknown): MatchEventVisualizationDto['attackPhase'] {
  if (value === 'START' || value === 'PROGRESS' || value === 'END') {
    return value;
  }
  return null;
}

function readAttackResult(value: unknown): MatchEventVisualizationDto['attackResult'] {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    return value as MatchEventVisualizationDto['attackResult'];
  }
  return null;
}
