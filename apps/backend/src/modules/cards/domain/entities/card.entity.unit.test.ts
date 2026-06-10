import { describe, expect, it } from 'vitest';

import {
  buildTestCard,
  TEST_CARD_RARITY_ID,
  TEST_CARD_TEMPLATE_ID,
  TEST_CARD_TYPE_ID,
  TEST_PLAYER_ID,
  TEST_PRIME_TYPE_ID,
} from '../../testing/card-test.factory';
import { CardOverallSource } from '../enums/card-overall-source.enum';
import { CardId } from '../value-objects/card-id.vo';
import { CardOverall } from '../value-objects/card-overall.vo';
import { CardVersion } from '../value-objects/card-version.vo';
import { ReferenceId } from '../value-objects/reference-id.vo';

describe('Card', () => {
  it('references type, rarity, and template by UUID — not enums', () => {
    const card = buildTestCard();

    expect(card.cardTypeId.value).toBe(TEST_CARD_TYPE_ID);
    expect(card.cardRarityId.value).toBe(TEST_CARD_RARITY_ID);
    expect(card.cardTemplateId.value).toBe(TEST_CARD_TEMPLATE_ID);
    expect(card.playerId).toBe(TEST_PLAYER_ID);
  });

  it('does not embed visual configuration', () => {
    const card = buildTestCard();

    expect('backgroundImage' in card).toBe(false);
    expect('primaryColor' in card).toBe(false);
  });

  it('supports multiple editions for one player via different type IDs', () => {
    const base = buildTestCard({
      id: CardId.create('550e8400-e29b-41d4-a716-446655440101'),
      cardTypeId: ReferenceId.create(TEST_CARD_TYPE_ID),
      overall: CardOverall.create(89),
      cardVersion: CardVersion.create('base'),
    });

    const prime = buildTestCard({
      id: CardId.create('550e8400-e29b-41d4-a716-446655440102'),
      cardTypeId: ReferenceId.create(TEST_PRIME_TYPE_ID),
      overall: CardOverall.create(99),
      cardVersion: CardVersion.create('prime'),
    });

    expect(base.playerId).toBe(prime.playerId);
    expect(base.cardTypeId.value).not.toBe(prime.cardTypeId.value);
  });

  it('preserves manual overall override', () => {
    const card = buildTestCard({
      overall: CardOverall.create(98),
      overallSource: CardOverallSource.MANUAL_OVERRIDE,
    });

    card.applyCalculatedOverall(CardOverall.create(85));

    expect(card.overall.value).toBe(98);
  });
});
