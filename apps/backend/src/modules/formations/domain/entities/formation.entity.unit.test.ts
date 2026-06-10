import { describe, expect, it } from 'vitest';

import { buildFormationFromTemplate } from '../constants/formation-templates';

describe('Formation', () => {
  it('creates a 4-4-2 formation with 11 slots', () => {
    const formation = buildFormationFromTemplate('4-4-2');

    expect(formation.code.value).toBe('4-4-2');
    expect(formation.slots).toHaveLength(11);
    expect(formation.slots[0]?.allowedPositions).toEqual(['GK']);
  });

  it('allows flexible positions on wide slots', () => {
    const formation = buildFormationFromTemplate('4-3-3');

    const leftWing = formation.slots[8];
    expect(leftWing?.allowsPosition('LW')).toBe(true);
    expect(leftWing?.allowsPosition('GK')).toBe(false);
  });
});
