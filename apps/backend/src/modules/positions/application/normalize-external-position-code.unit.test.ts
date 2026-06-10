import { describe, expect, it } from 'vitest';

import { normalizeExternalPositionCode } from './normalize-external-position-code';

describe('normalizeExternalPositionCode', () => {
  it('passes through valid shorthand codes', () => {
    expect(normalizeExternalPositionCode('RW')).toBe('RW');
    expect(normalizeExternalPositionCode('cdm')).toBe('CDM');
  });

  it('maps Transfermarkt labels', () => {
    expect(normalizeExternalPositionCode('Right Winger')).toBe('RW');
    expect(normalizeExternalPositionCode('Centre-Back')).toBe('CB');
    expect(normalizeExternalPositionCode('Defensive Midfield')).toBe('CDM');
  });

  it('maps left and right midfield labels that were truncated before', () => {
    expect(normalizeExternalPositionCode('Left Midfield')).toBe('LM');
    expect(normalizeExternalPositionCode('Right Midfield')).toBe('RM');
    expect(normalizeExternalPositionCode('LEFT')).toBe('LM');
    expect(normalizeExternalPositionCode('RIGH')).toBe('RM');
  });

  it('maps wing-back and wide midfield variants', () => {
    expect(normalizeExternalPositionCode('Left Wing-Back')).toBe('LWB');
    expect(normalizeExternalPositionCode('Right Wing-Back')).toBe('RWB');
    expect(normalizeExternalPositionCode('Left Midfielder')).toBe('LM');
    expect(normalizeExternalPositionCode('Right Midfielder')).toBe('RM');
  });

  it('falls back to CM for unknown labels', () => {
    expect(normalizeExternalPositionCode('Sweeper')).toBe('CM');
  });

  it('returns null for empty input', () => {
    expect(normalizeExternalPositionCode('')).toBeNull();
    expect(normalizeExternalPositionCode('   ')).toBeNull();
  });
});
