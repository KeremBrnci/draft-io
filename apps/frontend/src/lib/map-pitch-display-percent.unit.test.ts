import { describe, expect, it } from 'vitest';

import {
  mapDraftPitchDisplayX,
  mapDraftPitchDisplayY,
  mapPitchDisplayPercent,
} from './map-pitch-display-percent';

describe('mapPitchDisplayPercent', () => {
  it('keeps center and edges inside the visible pitch', () => {
    expect(mapPitchDisplayPercent(50)).toBe(50);
    expect(mapPitchDisplayPercent(0)).toBe(12);
    expect(mapPitchDisplayPercent(100)).toBe(88);
  });
});

describe('mapDraftPitchDisplayX', () => {
  it('spreads a flat midfield row wider than the default mapper', () => {
    const defaultGap = mapPitchDisplayPercent(40) - mapPitchDisplayPercent(20);
    const draftGap = mapDraftPitchDisplayX(40) - mapDraftPitchDisplayX(20);

    expect(draftGap).toBeGreaterThan(defaultGap);
    expect(draftGap).toBeGreaterThanOrEqual(20);
  });

  it('keeps mirrored wing positions symmetric', () => {
    expect(mapDraftPitchDisplayX(20) + mapDraftPitchDisplayX(80)).toBeCloseTo(100, 1);
    expect(mapDraftPitchDisplayX(40) + mapDraftPitchDisplayX(60)).toBeCloseTo(100, 1);
  });

  it('leaves center pivots on the halfway line', () => {
    expect(mapDraftPitchDisplayX(50)).toBe(50);
  });
});

describe('mapDraftPitchDisplayY', () => {
  it('spreads defensive and midfield lines further apart than the default mapper', () => {
    const defaultGap = mapPitchDisplayPercent(72) - mapPitchDisplayPercent(52);
    const draftGap = mapDraftPitchDisplayY(72) - mapDraftPitchDisplayY(52);

    expect(draftGap).toBeGreaterThan(defaultGap);
    expect(draftGap).toBeGreaterThanOrEqual(20);
  });

  it('keeps attack at the top and goalkeeper at the bottom', () => {
    expect(mapDraftPitchDisplayY(14)).toBeLessThan(mapDraftPitchDisplayY(52));
    expect(mapDraftPitchDisplayY(90)).toBeGreaterThan(mapDraftPitchDisplayY(72));
  });
});
