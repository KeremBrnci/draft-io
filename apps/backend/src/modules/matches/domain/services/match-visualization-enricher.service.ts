import type {
  GeneratedMatchEvent,
  MatchEventType,
  MatchPlayerSnapshot,
  MatchTeamSide,
  MatchTeamSnapshot,
} from '../../../simulation/domain/models/match-simulation.types';
import type { MatchEventVisualization, PitchZone } from '../models/match-visualization.types';

import { MatchMomentumTracker } from './match-momentum.service';

type FlowType = 'PASS' | 'DRIBBLE' | 'CROSS';

const ATTACK_BUILD_TYPES = new Set<MatchEventType>([
  'GOAL',
  'GOAL_CHANCE',
  'SHOT',
  'SHOT_ON_TARGET',
  'WOODWORK',
  'PENALTY',
  'MISSED_PENALTY',
  'OFFSIDE_GOAL',
]);

const REPLAY_EVENT_TYPES = new Set<MatchEventType>(['GOAL', 'PENALTY', 'RED_CARD', 'WOODWORK']);

interface SeededRng {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
}

function createRng(seed: number): SeededRng {
  let state = seed >>> 0;
  return {
    next(): number {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0x100000000;
    },
    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    pick<T>(items: readonly T[]): T {
      const item = items[this.int(0, items.length - 1)];
      if (item === undefined) {
        throw new Error('Cannot pick from empty array');
      }
      return item;
    },
  };
}

export class MatchVisualizationEnricher {
  enrich(input: {
    readonly events: readonly GeneratedMatchEvent[];
    readonly home: MatchTeamSnapshot;
    readonly away: MatchTeamSnapshot;
    readonly seed: number;
  }): readonly GeneratedMatchEvent[] {
    const rng = createRng(input.seed ^ 0x9e3779b9);
    const momentum = new MatchMomentumTracker();
    const enriched: GeneratedMatchEvent[] = [];
    let chainCounter = 0;
    let previousZone: PitchZone | null = null;

    for (const event of input.events) {
      if (ATTACK_BUILD_TYPES.has(event.eventType) && event.teamSide !== 'NEUTRAL') {
        const chainId = `chain-${chainCounter++}`;
        const team = event.teamSide === 'HOME' ? input.home : input.away;
        const flowEvents = this.buildAttackFlow({
          climax: event,
          team,
          teamSide: event.teamSide,
          chainId,
          rng,
          momentum,
          previousZone,
        });
        for (const flowEvent of flowEvents) {
          previousZone =
            (flowEvent.visualization?.ballZone as PitchZone | undefined) ?? previousZone;
          enriched.push(flowEvent);
        }
        continue;
      }

      const visualization = this.visualizeStandaloneEvent({
        event,
        home: input.home,
        away: input.away,
        momentum,
        previousZone,
        rng,
      });
      previousZone = visualization.ballZone;
      momentum.applyEvent({ eventType: event.eventType, teamSide: event.teamSide });
      enriched.push({
        ...event,
        secondaryCardId: event.secondaryCardId ?? null,
        visualization,
      });
    }

    return enriched;
  }

  private buildAttackFlow(input: {
    readonly climax: GeneratedMatchEvent;
    readonly team: MatchTeamSnapshot;
    readonly teamSide: MatchTeamSide;
    readonly chainId: string;
    readonly rng: SeededRng;
    readonly momentum: MatchMomentumTracker;
    readonly previousZone: PitchZone | null;
  }): GeneratedMatchEvent[] {
    const chainPlayers = this.pickChainPlayers(input.team, input.rng, 3, 4);
    const zones = attackZoneProgression(input.teamSide, chainPlayers.length + 1);
    const flowKinds = this.pickFlowKinds(chainPlayers.length - 1, input.rng);
    const events: GeneratedMatchEvent[] = [];
    let previousZone = input.previousZone ?? zones[0]!;

    for (let step = 0; step < chainPlayers.length - 1; step += 1) {
      const passer = chainPlayers[step]!;
      const receiver = chainPlayers[step + 1]!;
      const flowType = flowKinds[step] ?? 'PASS';
      const ballZone = zones[step + 1] ?? zones[zones.length - 1]!;
      const phase = step === 0 ? 'START' : 'PROGRESS';

      momentumApply(input.momentum, flowType, input.teamSide);
      const momentumSnapshot = input.momentum.snapshot(input.climax.minute);

      events.push({
        minute: input.climax.minute,
        eventType: flowType,
        teamSide: input.teamSide,
        playerName: passer.displayName,
        secondaryPlayerName: receiver.displayName,
        cardId: passer.cardId,
        secondaryCardId: receiver.cardId,
        commentary: flowCommentary(flowType, passer.displayName, receiver.displayName),
        xgValue: null,
        isGoal: false,
        visualization: {
          ballZone,
          previousBallZone: previousZone,
          activePlayerCardIds: [passer.cardId, receiver.cardId],
          activePlayerNames: [passer.displayName, receiver.displayName],
          secondaryPlayerCardId: receiver.cardId,
          attackChainId: input.chainId,
          attackChainStep: step + 1,
          attackChainPlayers: chainPlayers.map((player) => player.displayName),
          attackPhase: phase,
          attackResult: null,
          homeMomentum: momentumSnapshot.home,
          awayMomentum: momentumSnapshot.away,
          isReplayEligible: false,
        },
      });
      previousZone = ballZone;
    }

    const climaxPlayer = chainPlayers[chainPlayers.length - 1]!;
    const climaxZone = zones[zones.length - 1]!;
    input.momentum.applyEvent({
      eventType: input.climax.eventType,
      teamSide: input.teamSide,
    });
    const climaxMomentum = input.momentum.snapshot(input.climax.minute);

    events.push({
      ...input.climax,
      playerName: input.climax.playerName ?? climaxPlayer.displayName,
      cardId: input.climax.cardId ?? climaxPlayer.cardId,
      secondaryCardId: resolveSecondaryCardId(input.climax, input.team),
      visualization: {
        ballZone: climaxZone,
        previousBallZone: previousZone,
        activePlayerCardIds: [input.climax.cardId ?? climaxPlayer.cardId].filter(
          (id): id is string => id !== null,
        ),
        activePlayerNames: [input.climax.playerName ?? climaxPlayer.displayName],
        secondaryPlayerCardId: resolveSecondaryCardId(input.climax, input.team),
        attackChainId: input.chainId,
        attackChainStep: chainPlayers.length,
        attackChainPlayers: chainPlayers.map((player) => player.displayName),
        attackPhase: 'END',
        attackResult: attackResultForEvent(input.climax.eventType),
        homeMomentum: climaxMomentum.home,
        awayMomentum: climaxMomentum.away,
        isReplayEligible: REPLAY_EVENT_TYPES.has(input.climax.eventType),
      },
    });

    return events;
  }

  private visualizeStandaloneEvent(input: {
    readonly event: GeneratedMatchEvent;
    readonly home: MatchTeamSnapshot;
    readonly away: MatchTeamSnapshot;
    readonly momentum: MatchMomentumTracker;
    readonly previousZone: PitchZone | null;
    readonly rng: SeededRng;
  }): MatchEventVisualization {
    const team =
      input.event.teamSide === 'HOME'
        ? input.home
        : input.event.teamSide === 'AWAY'
          ? input.away
          : null;
    const ballZone = zoneForEventType(input.event.eventType, input.event.teamSide, input.rng);
    const activePlayer = pickActivePlayer(team, input.event, input.rng);
    const momentumSnapshot = input.momentum.snapshot(input.event.minute);

    return {
      ballZone,
      previousBallZone: input.previousZone,
      activePlayerCardIds: activePlayer === null ? [] : [activePlayer.cardId],
      activePlayerNames: activePlayer === null ? [] : [activePlayer.displayName],
      secondaryPlayerCardId: null,
      attackChainId: null,
      attackChainStep: null,
      attackChainPlayers: null,
      attackPhase: input.event.eventType === 'DANGEROUS_ATTACK' ? 'START' : null,
      attackResult:
        input.event.eventType === 'DANGEROUS_ATTACK'
          ? null
          : attackResultForEvent(input.event.eventType),
      homeMomentum: momentumSnapshot.home,
      awayMomentum: momentumSnapshot.away,
      isReplayEligible: REPLAY_EVENT_TYPES.has(input.event.eventType),
    };
  }

  private pickChainPlayers(
    team: MatchTeamSnapshot,
    rng: SeededRng,
    min: number,
    max: number,
  ): MatchPlayerSnapshot[] {
    const count = rng.int(min, max);
    const midfielders = team.players.filter((player) =>
      ['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(player.positionCode),
    );
    const attackers = team.players.filter((player) =>
      ['ST', 'CF', 'LW', 'RW', 'SS'].includes(player.positionCode),
    );
    const defenders = team.players.filter((player) =>
      ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(player.positionCode),
    );

    const pool = [
      ...(midfielders.length > 0 ? midfielders : team.players),
      ...(attackers.length > 0 ? attackers : team.players),
      ...(defenders.length > 0 ? defenders.slice(0, 1) : []),
    ];

    const unique = new Map<string, MatchPlayerSnapshot>();
    for (const player of pool) {
      unique.set(player.cardId, player);
    }

    const candidates = [...unique.values()];
    const selected: MatchPlayerSnapshot[] = [];
    const shuffled = [...candidates].sort(() => rng.next() - 0.5);

    for (const player of shuffled) {
      if (selected.length >= count) {
        break;
      }
      selected.push(player);
    }

    while (selected.length < min && team.players.length > 0) {
      selected.push(rng.pick(team.players));
    }

    return selected;
  }

  private pickFlowKinds(count: number, rng: SeededRng): FlowType[] {
    const kinds: FlowType[] = [];
    for (let index = 0; index < count; index += 1) {
      if (index === count - 1 && rng.next() < 0.45) {
        kinds.push('CROSS');
      } else if (rng.next() < 0.35) {
        kinds.push('DRIBBLE');
      } else {
        kinds.push('PASS');
      }
    }
    return kinds;
  }
}

function momentumApply(
  tracker: MatchMomentumTracker,
  flowType: FlowType,
  teamSide: MatchTeamSide,
): void {
  tracker.applyEvent({ eventType: flowType, teamSide });
}

function attackZoneProgression(teamSide: MatchTeamSide, steps: number): PitchZone[] {
  const homePath: PitchZone[] = ['C2', 'B2', 'B3', 'A2', 'A1'];
  const awayPath: PitchZone[] = ['A2', 'B2', 'B1', 'C2', 'C1'];
  const path = teamSide === 'HOME' ? homePath : awayPath;
  if (steps <= path.length) {
    return path.slice(0, steps);
  }
  return path;
}

function zoneForEventType(
  eventType: MatchEventType,
  teamSide: MatchTeamSide,
  rng: SeededRng,
): PitchZone {
  const lateral = (): '1' | '2' | '3' => {
    const roll = rng.next();
    if (roll < 0.33) return '1';
    if (roll < 0.66) return '2';
    return '3';
  };

  const rowForAttack = teamSide === 'HOME' ? 'A' : teamSide === 'AWAY' ? 'C' : 'B';
  const rowForMid = 'B';
  const rowForDefense = teamSide === 'HOME' ? 'C' : teamSide === 'AWAY' ? 'A' : 'B';

  switch (eventType) {
    case 'DANGEROUS_ATTACK':
    case 'GOAL_CHANCE':
      return `${rowForAttack}${lateral()}`;
    case 'CORNER':
      return `${rowForAttack}${rng.next() < 0.5 ? '1' : '3'}`;
    case 'FREE_KICK':
    case 'PENALTY':
      return `${rowForAttack}2`;
    case 'SHOT':
    case 'SHOT_ON_TARGET':
    case 'GOAL':
    case 'WOODWORK':
    case 'OFFSIDE_GOAL':
    case 'MISSED_PENALTY':
      return `${rowForAttack}2`;
    case 'YELLOW_CARD':
    case 'RED_CARD':
    case 'FOUL':
      return `${rowForMid}${lateral()}`;
    case 'KICK_OFF':
    case 'HALF_TIME':
    case 'FULL_TIME':
      return 'B2';
    default:
      return `${rowForDefense}${lateral()}`;
  }
}

function pickActivePlayer(
  team: MatchTeamSnapshot | null,
  event: GeneratedMatchEvent,
  rng: SeededRng,
): MatchPlayerSnapshot | null {
  if (event.cardId !== null && team !== null) {
    const matched = team.players.find((player) => player.cardId === event.cardId);
    if (matched !== undefined) {
      return matched;
    }
  }

  if (team === null || team.players.length === 0) {
    return null;
  }

  return rng.pick(team.players);
}

function flowCommentary(flowType: FlowType, passer: string, receiver: string): string {
  switch (flowType) {
    case 'PASS':
      return `${passer} pasını ${receiver}'a gönderdi.`;
    case 'DRIBBLE':
      return `${passer} topu sürüyor, ${receiver} destek veriyor.`;
    case 'CROSS':
      return `${passer} ortayı kesti, ${receiver} ceza sahasında.`;
  }
}

function attackResultForEvent(eventType: MatchEventType): string | null {
  switch (eventType) {
    case 'GOAL':
      return 'GOAL';
    case 'SHOT':
      return 'SHOT';
    case 'SHOT_ON_TARGET':
      return 'SHOT_ON_TARGET';
    case 'WOODWORK':
      return 'WOODWORK';
    case 'MISSED_PENALTY':
      return 'MISSED_PENALTY';
    case 'OFFSIDE_GOAL':
      return 'OFFSIDE_GOAL';
    case 'CORNER':
      return 'CORNER';
    case 'FREE_KICK':
      return 'FREE_KICK';
    case 'YELLOW_CARD':
    case 'RED_CARD':
      return 'CARD';
    default:
      return null;
  }
}

function resolveSecondaryCardId(
  event: GeneratedMatchEvent,
  team: MatchTeamSnapshot,
): string | null {
  if (event.secondaryCardId !== null && event.secondaryCardId !== undefined) {
    return event.secondaryCardId;
  }

  if (event.secondaryPlayerName === null) {
    return null;
  }

  const assister = team.players.find((player) => player.displayName === event.secondaryPlayerName);
  return assister?.cardId ?? null;
}
