import { Module } from '@nestjs/common';

import { provideUseCase } from '../../common/nest/provide-use-case';

import { GetDataQualitySummaryUseCase } from './application/use-cases/get-data-quality-summary.use-case';
import { ListDataQualityIssuesUseCase } from './application/use-cases/list-data-quality-issues.use-case';
import { DATA_QUALITY_REPOSITORY } from './domain/repositories/data-quality.repository';
import { PrismaDataQualityRepository } from './infrastructure/persistence/prisma-data-quality.repository';
import { AdminDataQualityController } from './presentation/controllers/admin-data-quality.controller';

@Module({
  controllers: [AdminDataQualityController],
  providers: [
    {
      provide: DATA_QUALITY_REPOSITORY,
      useClass: PrismaDataQualityRepository,
    },
    provideUseCase(GetDataQualitySummaryUseCase, [DATA_QUALITY_REPOSITORY]),
    provideUseCase(ListDataQualityIssuesUseCase, [DATA_QUALITY_REPOSITORY]),
  ],
  exports: [DATA_QUALITY_REPOSITORY, GetDataQualitySummaryUseCase, ListDataQualityIssuesUseCase],
})
export class DataQualityModule {}
