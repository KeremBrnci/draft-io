import { describe, expect, it } from 'vitest';

import {
  buildTestCard,
  buildTestCardRarity,
  buildTestCardTemplate,
  buildTestCardType,
  TEST_PLAYER_ID,
  TEST_PRIME_TYPE_ID,
} from '../../testing/card-test.factory';
import { CardId } from '../value-objects/card-id.vo';
import { CardOverall } from '../value-objects/card-overall.vo';
import { CardVersion } from '../value-objects/card-version.vo';
import { ReferenceCode } from '../value-objects/reference-code.vo';
import { ReferenceId } from '../value-objects/reference-id.vo';

describe('Player ↔ Card relationship', () => {
  it('allows one player identity to own many card editions', () => {
    const baseType = buildTestCardType();
    const primeType = buildTestCardType({
      id: ReferenceId.create(TEST_PRIME_TYPE_ID),
      code: ReferenceCode.create('PRIME_ICON'),
      name: 'Prime Icon',
    });
    const rarity = buildTestCardRarity();
    const template = buildTestCardTemplate();

    const baseCard = buildTestCard({
      id: CardId.create('550e8400-e29b-41d4-a716-446655440110'),
      cardTypeId: baseType.id,
      cardRarityId: rarity.id,
      cardTemplateId: template.id,
      overall: CardOverall.create(89),
      cardVersion: CardVersion.create('base'),
    });

    const primeCard = buildTestCard({
      id: CardId.create('550e8400-e29b-41d4-a716-446655440111'),
      cardTypeId: primeType.id,
      cardRarityId: rarity.id,
      cardTemplateId: template.id,
      overall: CardOverall.create(99),
      cardVersion: CardVersion.create('prime'),
    });

    expect(baseCard.playerId).toBe(TEST_PLAYER_ID);
    expect(primeCard.playerId).toBe(TEST_PLAYER_ID);
    expect(baseCard.id.value).not.toBe(primeCard.id.value);
    expect(baseCard.overall.value).toBeLessThan(primeCard.overall.value);
  });
});
