import type { MatchEventDto, MatchEventTypeDto } from '@draft-io/shared-types';

export interface LiveMatchStats {
  readonly homeXg: number;
  readonly awayXg: number;
  readonly homePossession: number;
  readonly awayPossession: number;
  readonly homeShots: number;
  readonly awayShots: number;
  readonly homeShotsOnTarget: number;
  readonly awayShotsOnTarget: number;
  readonly homeBigChances: number;
  readonly awayBigChances: number;
  readonly homeCorners: number;
  readonly awayCorners: number;
}

const SHOT_EVENTS = new Set<MatchEventTypeDto>([
  'SHOT',
  'SHOT_ON_TARGET',
  'GOAL',
  'WOODWORK',
  'PENALTY',
  'MISSED_PENALTY',
  'OFFSIDE_GOAL',
]);

const ON_TARGET_EVENTS = new Set<MatchEventTypeDto>([
  'SHOT_ON_TARGET',
  'GOAL',
  'WOODWORK',
  'MISSED_PENALTY',
]);

const BIG_CHANCE_EVENTS = new Set<MatchEventTypeDto>(['GOAL_CHANCE', 'PENALTY']);

const POSSESSION_WEIGHT: Partial<Record<MatchEventTypeDto, number>> = {
  DANGEROUS_ATTACK: 2,
  CORNER: 1.5,
  FREE_KICK: 1.5,
  SHOT: 2,
  SHOT_ON_TARGET: 2.5,
  GOAL: 3,
  WOODWORK: 2.5,
  PENALTY: 2,
  MISSED_PENALTY: 2,
  OFFSIDE_GOAL: 2.5,
  YELLOW_CARD: 0.5,
  RED_CARD: 0.5,
};

export function computeLiveMatchStats(events: readonly MatchEventDto[]): LiveMatchStats {
  let homeXg = 0;
  let awayXg = 0;
  let homeShots = 0;
  let awayShots = 0;
  let homeShotsOnTarget = 0;
  let awayShotsOnTarget = 0;
  let homeWeight = 0;
  let awayWeight = 0;
  let homeBigChances = 0;
  let awayBigChances = 0;
  let homeCorners = 0;
  let awayCorners = 0;

  for (const event of events) {
    if (event.teamSide === 'HOME') {
      if (event.xgValue !== null) {
        homeXg += event.xgValue;
      }
      if (BIG_CHANCE_EVENTS.has(event.eventType)) {
        homeBigChances += 1;
      }
      if (SHOT_EVENTS.has(event.eventType)) {
        homeShots += 1;
      }
      if (ON_TARGET_EVENTS.has(event.eventType)) {
        homeShotsOnTarget += 1;
      }
      if (event.eventType === 'CORNER') {
        homeCorners += 1;
      }
      homeWeight += POSSESSION_WEIGHT[event.eventType] ?? 0;
    }

    if (event.teamSide === 'AWAY') {
      if (event.xgValue !== null) {
        awayXg += event.xgValue;
      }
      if (BIG_CHANCE_EVENTS.has(event.eventType)) {
        awayBigChances += 1;
      }
      if (SHOT_EVENTS.has(event.eventType)) {
        awayShots += 1;
      }
      if (ON_TARGET_EVENTS.has(event.eventType)) {
        awayShotsOnTarget += 1;
      }
      if (event.eventType === 'CORNER') {
        awayCorners += 1;
      }
      awayWeight += POSSESSION_WEIGHT[event.eventType] ?? 0;
    }
  }

  const totalWeight = homeWeight + awayWeight;
  const homePossession = totalWeight === 0 ? 0 : Math.round((homeWeight / totalWeight) * 100);
  const awayPossession = totalWeight === 0 ? 0 : 100 - homePossession;

  return {
    homeXg: round2(homeXg),
    awayXg: round2(awayXg),
    homePossession,
    awayPossession,
    homeShots,
    awayShots,
    homeShotsOnTarget,
    awayShotsOnTarget,
    homeBigChances,
    awayBigChances,
    homeCorners,
    awayCorners,
  };
}

export function duelSharePct(
  home: number,
  away: number,
): { readonly home: number; readonly away: number } {
  const total = home + away;
  if (total <= 0) {
    return { home: 0, away: 0 };
  }

  const homePct = Math.round((home / total) * 100);
  return { home: homePct, away: 100 - homePct };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
