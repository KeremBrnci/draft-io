import { describe, expect, it } from 'vitest';

import { computePitchCoordinates } from './formation-pitch-layout.service';

describe('computePitchCoordinates', () => {
  it('places the goalkeeper at the bottom of the pitch', () => {
    expect(computePitchCoordinates('4-3-3', 1, 'GK')).toEqual({ pitchX: 50, pitchY: 90 });
  });

  it('matches the reference 4-4-2 shape', () => {
    const leftMid = computePitchCoordinates('4-4-2', 6, 'LM');
    const rightMid = computePitchCoordinates('4-4-2', 9, 'RM');
    const strikers = [
      computePitchCoordinates('4-4-2', 10, 'ST'),
      computePitchCoordinates('4-4-2', 11, 'ST'),
    ];

    expect(leftMid.pitchX).toBeLessThan(25);
    expect(rightMid.pitchX).toBeGreaterThan(75);
    expect(leftMid.pitchY).toBe(rightMid.pitchY);
    expect(strikers[0]?.pitchY).toBe(strikers[1]?.pitchY);
    expect(strikers[0]?.pitchY ?? 100).toBeLessThan(leftMid.pitchY);
  });

  it('matches the reference 4-2-3-1 shape', () => {
    const cam = computePitchCoordinates('4-2-3-1', 8, 'CAM');
    const striker = computePitchCoordinates('4-2-3-1', 10, 'ST');
    const leftWing = computePitchCoordinates('4-2-3-1', 9, 'LW');
    const rightWing = computePitchCoordinates('4-2-3-1', 11, 'RW');
    const pivotLeft = computePitchCoordinates('4-2-3-1', 6, 'CDM');

    expect(striker.pitchY).toBeLessThan(leftWing.pitchY);
    expect(leftWing.pitchY).toBe(cam.pitchY);
    expect(rightWing.pitchY).toBe(cam.pitchY);
    expect(leftWing.pitchX).toBeLessThan(cam.pitchX);
    expect(rightWing.pitchX).toBeGreaterThan(cam.pitchX);
    expect(pivotLeft.pitchY).toBeGreaterThan(cam.pitchY);
  });

  it('keeps 4-2-2-2 midfield rows separated', () => {
    const cdm = computePitchCoordinates('4-2-2-2', 6, 'CDM');
    const cam = computePitchCoordinates('4-2-2-2', 8, 'CAM');

    expect(cam.pitchY).toBeLessThan(cdm.pitchY);
    expect(cdm.pitchY - cam.pitchY).toBeGreaterThanOrEqual(18);
  });

  it('aligns 5-3-2 wingbacks with the back line', () => {
    const leftWingBack = computePitchCoordinates('5-3-2', 2, 'LWB');
    const centerBack = computePitchCoordinates('5-3-2', 3, 'CB');

    expect(leftWingBack.pitchY).toBe(centerBack.pitchY);
  });

  it('spreads the back four to the touchlines', () => {
    const leftBack = computePitchCoordinates('4-3-3', 2, 'LB');
    const rightBack = computePitchCoordinates('4-3-3', 5, 'RB');

    expect(leftBack.pitchX).toBeLessThan(25);
    expect(rightBack.pitchX).toBeGreaterThan(75);
    expect(leftBack.pitchY).toBe(rightBack.pitchY);
  });
});
