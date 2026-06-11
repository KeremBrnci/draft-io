import { describe, expect, it } from 'vitest';

import {
  deriveMatchStoppageTime,
  formatMatchMinuteLabel,
  getMatchMinuteMilestones,
  mapEventToInternalMinute,
} from './match-stoppage-time.js';

describe('deriveMatchStoppageTime', () => {
  it('returns values between 1 and 5 for each half', () => {
    for (let seed = 0; seed < 200; seed += 1) {
      const stoppage = deriveMatchStoppageTime(seed);
      expect(stoppage.firstHalfMinutes).toBeGreaterThanOrEqual(1);
      expect(stoppage.firstHalfMinutes).toBeLessThanOrEqual(5);
      expect(stoppage.secondHalfMinutes).toBeGreaterThanOrEqual(1);
      expect(stoppage.secondHalfMinutes).toBeLessThanOrEqual(5);
    }
  });
});

describe('match minute mapping', () => {
  const stoppage = { firstHalfMinutes: 3, secondHalfMinutes: 2 };
  const milestones = getMatchMinuteMilestones(stoppage);

  it('computes milestones with stoppage included', () => {
    expect(milestones).toEqual({
      firstHalfEnd: 48,
      secondHalfStart: 49,
      secondHalfRegularEnd: 93,
      matchEnd: 95,
    });
  });

  it('maps second-half simulation events after first-half stoppage', () => {
    expect(mapEventToInternalMinute(46, 'GOAL', stoppage)).toBe(49);
    expect(mapEventToInternalMinute(45, 'HALF_TIME', stoppage)).toBe(48);
    expect(mapEventToInternalMinute(90, 'FULL_TIME', stoppage)).toBe(95);
  });

  it('formats regular and stoppage labels', () => {
    expect(formatMatchMinuteLabel(12, stoppage)).toBe('12');
    expect(formatMatchMinuteLabel(46, stoppage)).toBe('45+1');
    expect(formatMatchMinuteLabel(48, stoppage)).toBe('45+3');
    expect(formatMatchMinuteLabel(49, stoppage)).toBe('46');
    expect(formatMatchMinuteLabel(93, stoppage)).toBe('90');
    expect(formatMatchMinuteLabel(94, stoppage)).toBe('90+1');
    expect(formatMatchMinuteLabel(95, stoppage)).toBe('90+2');
  });
});
