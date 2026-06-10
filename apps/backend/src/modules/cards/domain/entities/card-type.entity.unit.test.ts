import { describe, expect, it } from 'vitest';

import { buildTestCardType } from '../../testing/card-test.factory';
import { ReferenceCode } from '../value-objects/reference-code.vo';
import { ReferenceId } from '../value-objects/reference-id.vo';

describe('CardType', () => {
  it('stores database-driven type codes', () => {
    const cardType = buildTestCardType({
      code: ReferenceCode.create('TOTY'),
      name: 'Team of the Year',
    });

    expect(cardType.code.value).toBe('TOTY');
    expect(cardType.isActive).toBe(true);
  });

  it('can be deactivated without code changes', () => {
    const cardType = buildTestCardType();
    cardType.deactivate();

    expect(cardType.isActive).toBe(false);
  });

  it('assigns stable UUID identity separate from code', () => {
    const cardType = buildTestCardType({
      id: ReferenceId.create('770e8400-e29b-41d4-a716-446655440200'),
      code: ReferenceCode.create('FLASHBACK'),
    });

    expect(cardType.id.value).toMatch(/^[0-9a-f-]{36}$/i);
    expect(cardType.code.value).toBe('FLASHBACK');
  });
});
