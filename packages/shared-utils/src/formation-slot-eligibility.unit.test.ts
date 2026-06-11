import { describe, expect, it } from 'vitest';

import {
  canPlayerFillFormationSlot,
  canSwapDraftSlots,
  expandFormationSlotPositionCodes,
} from './formation-slot-eligibility.js';

describe('formation-slot-eligibility', () => {
  it('expands wing and striker slot codes', () => {
    expect(expandFormationSlotPositionCodes('LW', [])).toEqual(['LW', 'LM']);
    expect(expandFormationSlotPositionCodes('ST', [])).toEqual(['ST', 'CF']);
  });

  it('checks whether a player can fill a slot', () => {
    expect(canPlayerFillFormationSlot(['ST', 'LW'], 'LW', [])).toBe(true);
    expect(canPlayerFillFormationSlot(['ST'], 'LW', [])).toBe(false);
  });

  it('allows swap when both players fit opposite slots', () => {
    expect(
      canSwapDraftSlots({
        sourceCardPositions: ['ST', 'LW'],
        targetCardPositions: ['LW', 'ST'],
        sourceSlot: { label: 'ST', allowedPositions: [] },
        targetSlot: { label: 'LW', allowedPositions: [] },
      }),
    ).toBe(true);

    expect(
      canSwapDraftSlots({
        sourceCardPositions: ['ST'],
        targetCardPositions: ['CB'],
        sourceSlot: { label: 'ST', allowedPositions: [] },
        targetSlot: { label: 'LW', allowedPositions: [] },
      }),
    ).toBe(false);
  });
});
