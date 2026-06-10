import { CardOverallSource } from '../domain/enums/card-overall-source.enum';
import { Card } from '../domain/entities/card.entity';
import type { CreateCardProps } from '../domain/entities/card.entity';
import { CardRarity } from '../domain/entities/card-rarity.entity';
import type { CreateCardRarityProps } from '../domain/entities/card-rarity.entity';
import { CardTemplate } from '../domain/entities/card-template.entity';
import type { CreateCardTemplateProps } from '../domain/entities/card-template.entity';
import { CardType } from '../domain/entities/card-type.entity';
import type { CreateCardTypeProps } from '../domain/entities/card-type.entity';
import { CardId } from '../domain/value-objects/card-id.vo';
import { CardOverall } from '../domain/value-objects/card-overall.vo';
import { CardVersion } from '../domain/value-objects/card-version.vo';
import { ReferenceCode } from '../domain/value-objects/reference-code.vo';
import { ReferenceId } from '../domain/value-objects/reference-id.vo';

export const TEST_PLAYER_ID = '550e8400-e29b-41d4-a716-446655440000';
export const TEST_CARD_ID = '550e8400-e29b-41d4-a716-446655440100';
export const TEST_CARD_TYPE_ID = '550e8400-e29b-41d4-a716-446655440200';
export const TEST_CARD_RARITY_ID = '550e8400-e29b-41d4-a716-446655440201';
export const TEST_CARD_TEMPLATE_ID = '550e8400-e29b-41d4-a716-446655440202';
export const TEST_PRIME_TYPE_ID = '550e8400-e29b-41d4-a716-446655440203';

export function buildTestCardType(overrides: Partial<CreateCardTypeProps> = {}): CardType {
  return CardType.create({
    id: ReferenceId.create(TEST_CARD_TYPE_ID),
    code: ReferenceCode.create('BASE'),
    name: 'Base Card',
    description: 'Default edition',
    isActive: true,
    ...overrides,
  });
}

export function buildTestCardRarity(overrides: Partial<CreateCardRarityProps> = {}): CardRarity {
  return CardRarity.create({
    id: ReferenceId.create(TEST_CARD_RARITY_ID),
    code: ReferenceCode.create('COMMON'),
    name: 'Common',
    description: null,
    sortOrder: 10,
    isActive: true,
    ...overrides,
  });
}

export function buildTestCardTemplate(overrides: Partial<CreateCardTemplateProps> = {}): CardTemplate {
  return CardTemplate.create({
    id: ReferenceId.create(TEST_CARD_TEMPLATE_ID),
    cardTypeId: ReferenceId.create(TEST_CARD_TYPE_ID),
    name: 'Base Gold Template',
    backgroundImage: null,
    borderImage: null,
    animationKey: null,
    primaryColor: '#D4AF37',
    secondaryColor: '#FFFFFF',
    isActive: true,
    ...overrides,
  });
}

export function buildTestCard(overrides: Partial<CreateCardProps> = {}): Card {
  return Card.create({
    id: CardId.create(TEST_CARD_ID),
    playerId: TEST_PLAYER_ID,
    cardTypeId: ReferenceId.create(TEST_CARD_TYPE_ID),
    cardRarityId: ReferenceId.create(TEST_CARD_RARITY_ID),
    cardTemplateId: ReferenceId.create(TEST_CARD_TEMPLATE_ID),
    overall: CardOverall.create(89),
    overallSource: CardOverallSource.CALCULATED,
    cardVersion: CardVersion.create('2024'),
    releaseDate: null,
    isActive: true,
    ...overrides,
  });
}
