import { describe, expect, it } from 'vitest';

import { resolveDraftPlayerChemistryTier } from './draft-player-chemistry-badge';

describe('resolveDraftPlayerChemistryTier', () => {
  it('maps chemistry values to display tiers', () => {
    expect(resolveDraftPlayerChemistryTier(0)).toBe('none');
    expect(resolveDraftPlayerChemistryTier(1)).toBe('low');
    expect(resolveDraftPlayerChemistryTier(2)).toBe('mid');
    expect(resolveDraftPlayerChemistryTier(3)).toBe('high');
    expect(resolveDraftPlayerChemistryTier(5)).toBe('max');
  });
});
