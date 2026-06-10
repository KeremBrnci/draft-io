import { Module } from '@nestjs/common';

import { provideUseCase } from '../../common/nest/provide-use-case';

import { ApplyDraftPickUseCase } from './application/use-cases/apply-draft-pick.use-case';
import { CalculateTeamStrengthUseCase } from './application/use-cases/calculate-team-strength.use-case';
import { GeneratePickOptionsUseCase } from './application/use-cases/generate-pick-options.use-case';
import { GetDraftSessionByLobbyUseCase } from './application/use-cases/get-draft-session-by-lobby.use-case';
import { InitializeDraftSessionUseCase } from './application/use-cases/initialize-draft-session.use-case';
import { SimulateDraftFairnessUseCase } from './application/use-cases/simulate-draft-fairness.use-case';
import { RANDOM_SOURCE } from './domain/ports/random-source.port';
import { DRAFT_POOL_REPOSITORY } from './domain/repositories/draft-pool.repository';
import { DRAFT_SESSION_REPOSITORY } from './domain/repositories/draft-session.repository';
import { MathRandomSource } from './infrastructure/random/math-random-source';
import { PrismaDraftPoolRepository } from './infrastructure/persistence/prisma-draft-pool.repository';
import { PrismaDraftSessionRepository } from './infrastructure/persistence/prisma-draft-session.repository';
import { DraftBalanceController } from './presentation/controllers/draft-balance.controller';

@Module({
  controllers: [DraftBalanceController],
  providers: [
    { provide: RANDOM_SOURCE, useClass: MathRandomSource },
    { provide: DRAFT_POOL_REPOSITORY, useClass: PrismaDraftPoolRepository },
    { provide: DRAFT_SESSION_REPOSITORY, useClass: PrismaDraftSessionRepository },
    provideUseCase(InitializeDraftSessionUseCase, [DRAFT_SESSION_REPOSITORY, RANDOM_SOURCE]),
    provideUseCase(GetDraftSessionByLobbyUseCase, [DRAFT_SESSION_REPOSITORY]),
    provideUseCase(GeneratePickOptionsUseCase, [
      DRAFT_SESSION_REPOSITORY,
      DRAFT_POOL_REPOSITORY,
      RANDOM_SOURCE,
    ]),
    provideUseCase(ApplyDraftPickUseCase, [DRAFT_SESSION_REPOSITORY, DRAFT_POOL_REPOSITORY]),
    provideUseCase(CalculateTeamStrengthUseCase, [DRAFT_POOL_REPOSITORY]),
    provideUseCase(SimulateDraftFairnessUseCase, []),
  ],
  exports: [
    InitializeDraftSessionUseCase,
    GetDraftSessionByLobbyUseCase,
    GeneratePickOptionsUseCase,
    ApplyDraftPickUseCase,
    CalculateTeamStrengthUseCase,
    DRAFT_SESSION_REPOSITORY,
    DRAFT_POOL_REPOSITORY,
  ],
})
export class DraftModule {}
