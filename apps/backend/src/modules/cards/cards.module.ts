import { Module } from '@nestjs/common';

import { provideUseCase } from '../../common/nest/provide-use-case';

import { CardEnrichmentService } from './application/services/card-enrichment.service';
import { GetCardByIdUseCase } from './application/use-cases/get-card-by-id.use-case';
import { ListCardsByPlayerUseCase } from './application/use-cases/list-cards-by-player.use-case';
import { ListCardsUseCase } from './application/use-cases/list-cards.use-case';
import { CARD_RARITY_REPOSITORY } from './domain/repositories/card-rarity.repository';
import { CARD_TEMPLATE_REPOSITORY } from './domain/repositories/card-template.repository';
import { CARD_TYPE_REPOSITORY } from './domain/repositories/card-type.repository';
import { CARD_REPOSITORY } from './domain/repositories/card.repository';
import { PrismaCardRarityRepository } from './infrastructure/persistence/prisma-card-rarity.repository';
import { PrismaCardTemplateRepository } from './infrastructure/persistence/prisma-card-template.repository';
import { PrismaCardTypeRepository } from './infrastructure/persistence/prisma-card-type.repository';
import { PrismaCardRepository } from './infrastructure/persistence/prisma-card.repository';
import { PlayerCardSeedService } from './infrastructure/seed/player-card-seed.service';
import { CardsController } from './presentation/controllers/cards.controller';
import { PlayerCardsController } from './presentation/controllers/player-cards.controller';

@Module({
  controllers: [CardsController, PlayerCardsController],
  providers: [
    PlayerCardSeedService,
    { provide: CARD_REPOSITORY, useClass: PrismaCardRepository },
    { provide: CARD_TYPE_REPOSITORY, useClass: PrismaCardTypeRepository },
    { provide: CARD_RARITY_REPOSITORY, useClass: PrismaCardRarityRepository },
    { provide: CARD_TEMPLATE_REPOSITORY, useClass: PrismaCardTemplateRepository },
    {
      provide: CardEnrichmentService,
      useFactory: (
        cardTypeRepository: PrismaCardTypeRepository,
        cardRarityRepository: PrismaCardRarityRepository,
        cardTemplateRepository: PrismaCardTemplateRepository,
      ) =>
        new CardEnrichmentService(cardTypeRepository, cardRarityRepository, cardTemplateRepository),
      inject: [CARD_TYPE_REPOSITORY, CARD_RARITY_REPOSITORY, CARD_TEMPLATE_REPOSITORY],
    },
    provideUseCase(ListCardsUseCase, [CARD_REPOSITORY, CardEnrichmentService]),
    provideUseCase(GetCardByIdUseCase, [CARD_REPOSITORY, CardEnrichmentService]),
    provideUseCase(ListCardsByPlayerUseCase, [CARD_REPOSITORY, CardEnrichmentService]),
  ],
  exports: [
    CARD_REPOSITORY,
    CARD_TYPE_REPOSITORY,
    CARD_RARITY_REPOSITORY,
    CARD_TEMPLATE_REPOSITORY,
  ],
})
export class CardsModule {}
