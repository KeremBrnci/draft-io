import { Module } from '@nestjs/common';

import { provideUseCase } from '../../common/nest/provide-use-case';
import { CardsModule } from '../cards/cards.module';
import { CARD_REPOSITORY, type CardRepository } from '../cards/domain/repositories/card.repository';
import { LEAGUE_REPOSITORY } from '../leagues/domain/repositories/league.repository';
import { LeaguesModule } from '../leagues/leagues.module';
import { PLAYER_REPOSITORY } from '../players/domain/repositories/player.repository';
import { PlayersModule } from '../players/players.module';

import { ManualOverrideGuardService } from './application/services/manual-override-guard.service';
import { OverallCalculatorV1 } from './application/services/overall-calculator-v1.service';
import { CalculatePlayerOverallUseCase } from './application/use-cases/calculate-player-overall.use-case';
import { GetOverallHistoryUseCase } from './application/use-cases/get-overall-history.use-case';
import { GetPlayerMetricsUseCase } from './application/use-cases/get-player-metrics.use-case';
import { RecalculateOverallUseCase } from './application/use-cases/recalculate-overall.use-case';
import { UpsertPlayerMetricsUseCase } from './application/use-cases/upsert-player-metrics.use-case';
import { CARD_OVERALL_INTEGRATION } from './domain/ports/card-overall-integration.port';
import { OVERALL_CALCULATOR } from './domain/ports/overall-calculator.port';
import { OVERALL_ALGORITHM_VERSION_REPOSITORY } from './domain/repositories/overall-algorithm-version.repository';
import { OVERALL_CALCULATION_REPOSITORY } from './domain/repositories/overall-calculation.repository';
import { PLAYER_METRICS_REPOSITORY } from './domain/repositories/player-metrics.repository';
import { CardOverallIntegrationAdapter } from './infrastructure/adapters/card-overall-integration.adapter';
import { PrismaOverallAlgorithmVersionRepository } from './infrastructure/persistence/prisma-overall-algorithm-version.repository';
import { PrismaOverallCalculationRepository } from './infrastructure/persistence/prisma-overall-calculation.repository';
import { PrismaPlayerMetricsRepository } from './infrastructure/persistence/prisma-player-metrics.repository';
import { AdminOverallController } from './presentation/controllers/admin-overall.controller';

@Module({
  imports: [PlayersModule, LeaguesModule, CardsModule],
  controllers: [AdminOverallController],
  providers: [
    OverallCalculatorV1,
    {
      provide: OVERALL_CALCULATOR,
      useExisting: OverallCalculatorV1,
    },
    {
      provide: PLAYER_METRICS_REPOSITORY,
      useClass: PrismaPlayerMetricsRepository,
    },
    {
      provide: OVERALL_CALCULATION_REPOSITORY,
      useClass: PrismaOverallCalculationRepository,
    },
    {
      provide: OVERALL_ALGORITHM_VERSION_REPOSITORY,
      useClass: PrismaOverallAlgorithmVersionRepository,
    },
    {
      provide: ManualOverrideGuardService,
      useFactory: (cardRepository: CardRepository) =>
        new ManualOverrideGuardService(cardRepository),
      inject: [CARD_REPOSITORY],
    },
    {
      provide: CARD_OVERALL_INTEGRATION,
      useClass: CardOverallIntegrationAdapter,
    },
    provideUseCase(CalculatePlayerOverallUseCase, [
      PLAYER_REPOSITORY,
      LEAGUE_REPOSITORY,
      PLAYER_METRICS_REPOSITORY,
      OVERALL_CALCULATION_REPOSITORY,
      OVERALL_ALGORITHM_VERSION_REPOSITORY,
      OVERALL_CALCULATOR,
      ManualOverrideGuardService,
      CARD_OVERALL_INTEGRATION,
    ]),
    provideUseCase(RecalculateOverallUseCase, [PLAYER_REPOSITORY, CalculatePlayerOverallUseCase]),
    provideUseCase(GetOverallHistoryUseCase, [OVERALL_CALCULATION_REPOSITORY]),
    provideUseCase(GetPlayerMetricsUseCase, [PLAYER_METRICS_REPOSITORY]),
    provideUseCase(UpsertPlayerMetricsUseCase, [
      PLAYER_METRICS_REPOSITORY,
      OVERALL_ALGORITHM_VERSION_REPOSITORY,
    ]),
  ],
  exports: [OVERALL_CALCULATOR, PLAYER_METRICS_REPOSITORY, OVERALL_CALCULATION_REPOSITORY],
})
export class OverallEngineModule {}
