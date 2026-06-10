import { describe, expect, it } from 'vitest';

import { buildTestCardRarity } from '../../testing/card-test.factory';
import { ReferenceCode } from '../value-objects/reference-code.vo';

describe('CardRarity', () => {
  it('orders rarities for UI and pack weighting', () => {
    const common = buildTestCardRarity({ sortOrder: 10 });
    const legendary = buildTestCardRarity({
      code: ReferenceCode.create('LEGENDARY'),
      name: 'Legendary',
      sortOrder: 40,
    });

    expect(legendary.sortOrder).toBeGreaterThan(common.sortOrder);
  });

  it('supports future rarity codes without enum changes', () => {
    const mythic = buildTestCardRarity({
      code: ReferenceCode.create('MYTHIC'),
      name: 'Mythic',
      sortOrder: 50,
    });

    expect(mythic.code.value).toBe('MYTHIC');
  });
});
