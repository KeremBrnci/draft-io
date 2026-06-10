import type { ApiResponse } from '@draft-io/shared-types';
import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post } from '@nestjs/common';

import { CalculatePlayerOverallUseCase } from '../../application/use-cases/calculate-player-overall.use-case';
import { GetOverallHistoryUseCase } from '../../application/use-cases/get-overall-history.use-case';
import { GetPlayerMetricsUseCase } from '../../application/use-cases/get-player-metrics.use-case';
import { RecalculateOverallUseCase } from '../../application/use-cases/recalculate-overall.use-case';
import { UpsertPlayerMetricsUseCase } from '../../application/use-cases/upsert-player-metrics.use-case';
import {
  OVERALL_ALGORITHM_VERSION_REPOSITORY,
  type OverallAlgorithmVersionRepository,
} from '../../domain/repositories/overall-algorithm-version.repository';
import { RecalculateOverallDto } from '../dto/recalculate-overall.dto';
import { UpsertPlayerMetricsDto } from '../dto/upsert-player-metrics.dto';
import {
  toCalculateOverallResultDto,
  toOverallCalculationDto,
  toPlayerMetricsDto,
  toRecalculateOverallResultDto,
} from '../mappers/overall-response.mapper';

@Controller('admin/overall')
export class AdminOverallController {
  constructor(
    private readonly calculatePlayerOverallUseCase: CalculatePlayerOverallUseCase,
    private readonly recalculateOverallUseCase: RecalculateOverallUseCase,
    private readonly getOverallHistoryUseCase: GetOverallHistoryUseCase,
    private readonly getPlayerMetricsUseCase: GetPlayerMetricsUseCase,
    private readonly upsertPlayerMetricsUseCase: UpsertPlayerMetricsUseCase,
    @Inject(OVERALL_ALGORITHM_VERSION_REPOSITORY)
    private readonly algorithmVersionRepository: OverallAlgorithmVersionRepository,
  ) {}

  @Post('calculate/:playerId')
  @HttpCode(HttpStatus.OK)
  async calculate(
    @Param('playerId') playerId: string,
  ): Promise<ApiResponse<ReturnType<typeof toCalculateOverallResultDto>>> {
    const result = await this.calculatePlayerOverallUseCase.execute({ playerId });
    const version = await this.resolveVersion(result.calculation.algorithmVersionId);

    return { data: toCalculateOverallResultDto(result, version) };
  }

  @Post('recalculate')
  @HttpCode(HttpStatus.OK)
  async recalculate(
    @Body() body: RecalculateOverallDto,
  ): Promise<ApiResponse<ReturnType<typeof toRecalculateOverallResultDto>>> {
    const result = await this.recalculateOverallUseCase.execute({
      ...(body.playerIds !== undefined ? { playerIds: body.playerIds } : {}),
      ...(body.leagueId !== undefined ? { leagueId: body.leagueId } : {}),
      ...(body.algorithmVersion !== undefined ? { algorithmVersion: body.algorithmVersion } : {}),
    });

    return { data: toRecalculateOverallResultDto(result) };
  }

  @Get('history/:playerId')
  @HttpCode(HttpStatus.OK)
  async history(
    @Param('playerId') playerId: string,
  ): Promise<ApiResponse<readonly ReturnType<typeof toOverallCalculationDto>[]>> {
    const calculations = await this.getOverallHistoryUseCase.execute(playerId);
    const versionCache = new Map<string, Awaited<ReturnType<OverallAlgorithmVersionRepository['findById']>>>();

    const data = await Promise.all(
      calculations.map(async (calculation) => {
        let version = versionCache.get(calculation.algorithmVersionId);

        if (version === undefined) {
          version = await this.algorithmVersionRepository.findById(calculation.algorithmVersionId);
          versionCache.set(calculation.algorithmVersionId, version);
        }

        const versionRecord = version ?? (await this.algorithmVersionRepository.ensureVersion('V1', 'Overall Engine V1'));
        return toOverallCalculationDto(calculation, versionRecord);
      }),
    );

    return { data };
  }

  @Get('metrics/:playerId')
  @HttpCode(HttpStatus.OK)
  async metrics(
    @Param('playerId') playerId: string,
  ): Promise<ApiResponse<ReturnType<typeof toPlayerMetricsDto>>> {
    const metrics = await this.getPlayerMetricsUseCase.execute(playerId);
    const version = await this.resolveVersion(metrics.algorithmVersionId);

    return { data: toPlayerMetricsDto(metrics, version) };
  }

  @Post('metrics/:playerId')
  @HttpCode(HttpStatus.OK)
  async upsertMetrics(
    @Param('playerId') playerId: string,
    @Body() body: UpsertPlayerMetricsDto,
  ): Promise<ApiResponse<ReturnType<typeof toPlayerMetricsDto>>> {
    const metrics = await this.upsertPlayerMetricsUseCase.execute({
      playerId,
      ...(body.careerScore !== undefined ? { careerScore: body.careerScore } : {}),
      ...(body.legacyScore !== undefined ? { legacyScore: body.legacyScore } : {}),
      ...(body.profileTag !== undefined ? { profileTag: body.profileTag } : {}),
    });

    const version = await this.resolveVersion(metrics.algorithmVersionId);

    return { data: toPlayerMetricsDto(metrics, version) };
  }

  private async resolveVersion(versionId: string) {
    return (
      (await this.algorithmVersionRepository.findById(versionId)) ??
      (await this.algorithmVersionRepository.ensureVersion('V1', 'Overall Engine V1'))
    );
  }
}
