import type { MatchTeamSide } from '../../../simulation/domain/models/match-simulation.types';

export interface MomentumState {
  home: number;
  away: number;
}

const MIN_MOMENTUM = 0.15;
const MAX_MOMENTUM = 0.85;

export class MatchMomentumTracker {
  private home = 0.5;
  private away = 0.5;
  private readonly history: { minute: number; home: number; away: number }[] = [];

  snapshot(minute: number): MomentumState {
    this.history.push({ minute, home: this.home, away: this.away });
    return { home: this.home, away: this.away };
  }

  trend(currentMinute: number): { homeTrend: number; awayTrend: number } {
    const windowStart = Math.max(0, currentMinute - 5);
    const inWindow = this.history.filter((entry) => entry.minute >= windowStart);
    if (inWindow.length < 2) {
      return { homeTrend: 0, awayTrend: 0 };
    }

    const first = inWindow[0]!;
    const last = inWindow[inWindow.length - 1]!;
    return {
      homeTrend: last.home - first.home,
      awayTrend: last.away - first.away,
    };
  }

  applyEvent(input: { readonly eventType: string; readonly teamSide: MatchTeamSide }): void {
    if (input.teamSide === 'NEUTRAL') {
      return;
    }

    const isHome = input.teamSide === 'HOME';
    const delta = momentumDeltaForEvent(input.eventType);

    if (delta === 0) {
      return;
    }

    if (isHome) {
      this.home = clamp(this.home + delta);
      this.away = clamp(this.away - delta * 0.55);
    } else {
      this.away = clamp(this.away + delta);
      this.home = clamp(this.home - delta * 0.55);
    }
  }
}

function momentumDeltaForEvent(eventType: string): number {
  switch (eventType) {
    case 'GOAL':
      return 0.14;
    case 'GOAL_CHANCE':
    case 'SHOT_ON_TARGET':
    case 'WOODWORK':
      return 0.05;
    case 'SHOT':
    case 'PENALTY':
      return 0.035;
    case 'DANGEROUS_ATTACK':
    case 'CORNER':
    case 'FREE_KICK':
      return 0.025;
    case 'PASS':
    case 'DRIBBLE':
    case 'CROSS':
      return 0.012;
    case 'YELLOW_CARD':
      return -0.03;
    case 'RED_CARD':
      return -0.06;
    case 'MISSED_PENALTY':
      return -0.04;
    default:
      return 0;
  }
}

function clamp(value: number): number {
  return Math.min(MAX_MOMENTUM, Math.max(MIN_MOMENTUM, value));
}

export function toMomentumPercent(state: MomentumState): { home: number; away: number } {
  const total = state.home + state.away;
  if (total <= 0) {
    return { home: 50, away: 50 };
  }

  return {
    home: Math.round((state.home / total) * 100),
    away: Math.round((state.away / total) * 100),
  };
}
