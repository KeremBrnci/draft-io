import { describe, expect, it, vi } from 'vitest';

import {
  buildTestCard,
  buildTestCardRarity,
  buildTestCardTemplate,
  buildTestCardType,
  TEST_CARD_ID,
} from '../../testing/card-test.factory';
import { CardNotFoundError } from '../../domain/errors/card.errors';
import type { CardRarityRepository } from '../../domain/repositories/card-rarity.repository';
import type { CardTemplateRepository } from '../../domain/repositories/card-template.repository';
import type { CardTypeRepository } from '../../domain/repositories/card-type.repository';
import type { CardRepository } from '../../domain/repositories/card.repository';
import { CardEnrichmentService } from '../services/card-enrichment.service';

import { GetCardByIdUseCase } from './get-card-by-id.use-case';

describe('GetCardByIdUseCase', () => {
  it('returns enriched card when found', async () => {
    const card = buildTestCard();

    const cardRepository: CardRepository = {
      findById: vi.fn().mockResolvedValue(card),
      findAll: vi.fn(),
      findByPlayerId: vi.fn(),
      save: vi.fn(),
    };
    const cardTypeRepository: CardTypeRepository = {
      findById: vi.fn(),
      findByCode: vi.fn(),
      findAll: vi.fn().mockResolvedValue([buildTestCardType()]),
      save: vi.fn(),
    };
    const cardRarityRepository: CardRarityRepository = {
      findById: vi.fn(),
      findByCode: vi.fn(),
      findAll: vi.fn().mockResolvedValue([buildTestCardRarity()]),
      save: vi.fn(),
    };
    const cardTemplateRepository: CardTemplateRepository = {
      findById: vi.fn(),
      findByCardTypeId: vi.fn(),
      findAll: vi.fn().mockResolvedValue([buildTestCardTemplate()]),
      save: vi.fn(),
    };

    const useCase = new GetCardByIdUseCase(
      cardRepository,
      new CardEnrichmentService(cardTypeRepository, cardRarityRepository, cardTemplateRepository),
    );

    const result = await useCase.execute({ cardId: TEST_CARD_ID });

    expect(result.card.id.value).toBe(TEST_CARD_ID);
    expect(result.cardTypeCode).toBe('BASE');
  });

  it('throws when card is missing', async () => {
    const cardRepository: CardRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findAll: vi.fn(),
      findByPlayerId: vi.fn(),
      save: vi.fn(),
    };

    const useCase = new GetCardByIdUseCase(
      cardRepository,
      new CardEnrichmentService(
        { findAll: vi.fn().mockResolvedValue([]) } as unknown as CardTypeRepository,
        { findAll: vi.fn().mockResolvedValue([]) } as unknown as CardRarityRepository,
        { findAll: vi.fn().mockResolvedValue([]) } as unknown as CardTemplateRepository,
      ),
    );

    await expect(useCase.execute({ cardId: TEST_CARD_ID })).rejects.toThrow(CardNotFoundError);
  });
});
