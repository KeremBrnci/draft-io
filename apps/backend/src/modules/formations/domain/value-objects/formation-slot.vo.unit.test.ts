import { describe, expect, it } from 'vitest';

import { FormationSlot } from './formation-slot.vo';

describe('FormationSlot', () => {
  it('creates a valid slot', () => {
    const slot = FormationSlot.create({
      index: 1,
      label: 'GK',
      allowedPositions: ['GK'],
    });

    expect(slot.index).toBe(1);
    expect(slot.label).toBe('GK');
    expect(slot.allowsPosition('GK')).toBe(true);
    expect(slot.allowsPosition('ST')).toBe(false);
  });

  it('rejects invalid index', () => {
    expect(() =>
      FormationSlot.create({ index: 0, label: 'GK', allowedPositions: ['GK'] }),
    ).toThrow(/between 1 and 11/);
  });

  it('rejects empty allowed positions', () => {
    expect(() =>
      FormationSlot.create({ index: 1, label: 'GK', allowedPositions: [] }),
    ).toThrow(/at least one position/);
  });
});
