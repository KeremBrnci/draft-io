import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import { LeagueId } from '../../../leagues/domain/value-objects/league-id.vo';
import type { PlayerRepository } from '../../../players/domain/repositories/player.repository';
import { PlayerId } from '../../../players/domain/value-objects/player-id.vo';
import type { OverallCalculation } from '../../domain/entities/overall-calculation.entity';
import type { PlayerMetrics } from '../../domain/entities/player-metrics.entity';
import { OVERALL_ALGORITHM_V1 } from '../../domain/enums/overall-algorithm-version.enum';
import type { CardOverallIntegrationPort } from '../../domain/ports/card-overall-integration.port';
import type { OverallCalculator } from '../../domain/ports/overall-calculator.port';
import type { OverallAlgorithmVersionRepository } from '../../domain/repositories/overall-algorithm-version.repository';
import type { OverallCalculationRepository } from '../../domain/repositories/overall-calculation.repository';
import type { PlayerMetricsRepository } from '../../domain/repositories/player-metrics.repository';
import { type ManualOverrideGuardService } from '../services/manual-override-guard.service';
import { OverallContextBuilderService } from '../services/overall-context-builder.service';

export interface CalculatePlayerOverallCommand {
  readonly playerId: string;
  readonly algorithmVersion?: string;
}

export interface CalculatePlayerOverallResult {
  readonly calculation: OverallCalculation;
  readonly metrics: PlayerMetrics;
  readonly skippedDueToManualOverride: boolean;
}

export class CalculatePlayerOverallUseCase {
  private readonly contextBuilder = new OverallContextBuilderService();

  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly leagueRepository: LeagueRepository,
    private readonly playerMetricsRepository: PlayerMetricsRepository,
    private readonly overallCalculationRepository: OverallCalculationRepository,
    private readonly algorithmVersionRepository: OverallAlgorithmVersionRepository,
    private readonly overallCalculator: OverallCalculator,
    private readonly manualOverrideGuard: ManualOverrideGuardService,
    private readonly cardOverallIntegration: CardOverallIntegrationPort,
  ) {}

  async execute(command: CalculatePlayerOverallCommand): Promise<CalculatePlayerOverallResult> {
    const versionCode = command.algorithmVersion ?? OVERALL_ALGORITHM_V1;
    const version = await this.algorithmVersionRepository.ensureVersion(
      versionCode,
      `Overall Engine ${versionCode}`,
      'Weighted component model for base card ratings',
    );

    const player = await this.playerRepository.findById(PlayerId.create(command.playerId));

    if (player === null) {
      throw new Error(`Player not found: ${command.playerId}`);
    }

    const league =
      player.leagueId === null
        ? null
        : await this.leagueRepository.findById(LeagueId.create(player.leagueId));

    const existingMetrics = await this.playerMetricsRepository.findByPlayerId(command.playerId);
    const context = this.contextBuilder.build(player, league, existingMetrics);
    const result = this.overallCalculator.calculate(context);

    const metrics = await this.playerMetricsRepository.upsert({
      playerId: command.playerId,
      algorithmVersionId: version.id,
      marketValueScore: result.components.marketValueScore,
      careerScore: result.components.careerScore,
      ageScore: result.components.ageScore,
      leagueScore: result.components.leagueScore,
      legacyScore: result.components.legacyScore,
      profileTag: result.profileTag,
    });

    const calculation = await this.overallCalculationRepository.create({
      playerId: command.playerId,
      algorithmVersionId: version.id,
      marketValueScore: result.components.marketValueScore,
      careerScore: result.components.careerScore,
      ageScore: result.components.ageScore,
      leagueScore: result.components.leagueScore,
      legacyScore: result.components.legacyScore,
      rawScore: result.rawScore,
      finalOverall: result.finalOverall,
      profileTag: result.profileTag,
      appliedFloor: result.appliedFloor,
      appliedCeiling: result.appliedCeiling,
    });

    const skippedDueToManualOverride = await this.manualOverrideGuard.hasManualOverride(
      command.playerId,
    );

    if (!skippedDueToManualOverride) {
      await this.cardOverallIntegration.applyCalculatedOverallToBaseCards(
        command.playerId,
        result.finalOverall,
      );
    }

    return { calculation, metrics, skippedDueToManualOverride };
  }
}
