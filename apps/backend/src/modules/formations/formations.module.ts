import { Module } from '@nestjs/common';

import { provideUseCase } from '../../common/nest/provide-use-case';
import { DatabaseModule } from '../../infrastructure/database/database.module';

import { GetFormationUseCase } from './application/use-cases/get-formation.use-case';
import { ListFormationsUseCase } from './application/use-cases/list-formations.use-case';
import { FORMATION_REPOSITORY } from './domain/repositories/formation.repository';
import { PrismaFormationRepository } from './infrastructure/persistence/prisma-formation.repository';
import { FormationSeedService } from './infrastructure/seed/formation-seed.service';
import { FormationsController } from './presentation/controllers/formations.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [FormationsController],
  providers: [
    FormationSeedService,
    provideUseCase(ListFormationsUseCase, [FORMATION_REPOSITORY]),
    provideUseCase(GetFormationUseCase, [FORMATION_REPOSITORY]),
    {
      provide: FORMATION_REPOSITORY,
      useClass: PrismaFormationRepository,
    },
  ],
  exports: [ListFormationsUseCase, GetFormationUseCase, FORMATION_REPOSITORY],
})
export class FormationsModule {}
