import { describe, expect, it } from 'vitest';

import { MatchMomentumTracker, toMomentumPercent } from './match-momentum.service';

describe('MatchMomentumTracker', () => {
  it('shifts momentum toward the scoring side on goals', () => {
    const tracker = new MatchMomentumTracker();
    tracker.applyEvent({ eventType: 'GOAL', teamSide: 'HOME' });
    const snapshot = tracker.snapshot(10);
    const percents = toMomentumPercent(snapshot);

    expect(percents.home).toBeGreaterThan(percents.away);
  });

  it('tracks five-minute trend', () => {
    const tracker = new MatchMomentumTracker();
    tracker.snapshot(1);
    tracker.applyEvent({ eventType: 'DANGEROUS_ATTACK', teamSide: 'AWAY' });
    tracker.snapshot(3);
    tracker.applyEvent({ eventType: 'SHOT_ON_TARGET', teamSide: 'AWAY' });
    tracker.snapshot(6);

    const trend = tracker.trend(6);
    expect(trend.awayTrend).toBeGreaterThan(0);
  });
});
