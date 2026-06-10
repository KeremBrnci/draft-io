import { describe, expect, it, vi } from 'vitest';

import type { CardRarityRepository } from '../../domain/repositories/card-rarity.repository';
import type { CardTemplateRepository } from '../../domain/repositories/card-template.repository';
import type { CardTypeRepository } from '../../domain/repositories/card-type.repository';
import type { CardRepository } from '../../domain/repositories/card.repository';
import {
  buildTestCard,
  buildTestCardRarity,
  buildTestCardTemplate,
  buildTestCardType,
} from '../../testing/card-test.factory';
import { CardEnrichmentService } from '../services/card-enrichment.service';

import { ListCardsUseCase } from './list-cards.use-case';

describe('ListCardsUseCase', () => {
  it('filters and enriches cards via repository contracts', async () => {
    const card = buildTestCard();
    const cardType = buildTestCardType();
    const cardRarity = buildTestCardRarity();
    const cardTemplate = buildTestCardTemplate();

    const cardRepository: CardRepository = {
      findById: vi.fn(),
      findAll: vi.fn().mockResolvedValue([card]),
      findByPlayerId: vi.fn(),
      save: vi.fn(),
    };
    const cardTypeRepository: CardTypeRepository = {
      findById: vi.fn(),
      findByCode: vi.fn(),
      findAll: vi.fn().mockResolvedValue([cardType]),
      save: vi.fn(),
    };
    const cardRarityRepository: CardRarityRepository = {
      findById: vi.fn(),
      findByCode: vi.fn(),
      findAll: vi.fn().mockResolvedValue([cardRarity]),
      save: vi.fn(),
    };
    const cardTemplateRepository: CardTemplateRepository = {
      findById: vi.fn(),
      findByCardTypeId: vi.fn(),
      findAll: vi.fn().mockResolvedValue([cardTemplate]),
      save: vi.fn(),
    };

    const enrichment = new CardEnrichmentService(
      cardTypeRepository,
      cardRarityRepository,
      cardTemplateRepository,
    );
    const useCase = new ListCardsUseCase(cardRepository, enrichment);

    const result = await useCase.execute({
      filter: { cardTypeCode: 'BASE', minOverall: 80 },
    });

    expect(cardRepository.findAll).toHaveBeenCalledWith({
      cardTypeCode: 'BASE',
      minOverall: 80,
    });
    expect(result[0]?.cardTypeCode).toBe('BASE');
    expect(result[0]?.cardRarityCode).toBe('COMMON');
  });
});
