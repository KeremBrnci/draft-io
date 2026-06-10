import type { PlayerRepository } from '../../../players/domain/repositories/player.repository';
import { OVERALL_ALGORITHM_V1 } from '../../domain/enums/overall-algorithm-version.enum';

import type { CalculatePlayerOverallUseCase } from './calculate-player-overall.use-case';

export interface RecalculateOverallCommand {
  readonly playerIds?: readonly string[];
  readonly leagueId?: string;
  readonly algorithmVersion?: string;
}

export interface RecalculateOverallResult {
  readonly processed: number;
  readonly calculated: number;
  readonly skippedManualOverride: number;
  readonly failed: number;
}

export class RecalculateOverallUseCase {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly calculatePlayerOverallUseCase: CalculatePlayerOverallUseCase,
  ) {}

  async execute(command: RecalculateOverallCommand = {}): Promise<RecalculateOverallResult> {
    const playerIds = await this.resolvePlayerIds(command);
    let calculated = 0;
    let skippedManualOverride = 0;
    let failed = 0;

    for (const playerId of playerIds) {
      try {
        const result = await this.calculatePlayerOverallUseCase.execute({
          playerId,
          algorithmVersion: command.algorithmVersion ?? OVERALL_ALGORITHM_V1,
        });

        calculated += 1;

        if (result.skippedDueToManualOverride) {
          skippedManualOverride += 1;
        }
      } catch {
        failed += 1;
      }
    }

    return {
      processed: playerIds.length,
      calculated,
      skippedManualOverride,
      failed,
    };
  }

  private async resolvePlayerIds(command: RecalculateOverallCommand): Promise<readonly string[]> {
    if (command.playerIds !== undefined && command.playerIds.length > 0) {
      return command.playerIds;
    }

    const page = await this.playerRepository.findPaginated(
      {
        ...(command.leagueId !== undefined ? { leagueId: command.leagueId } : {}),
        hasMarketValue: true,
      },
      { field: 'name', direction: 'asc' },
      { page: 1, pageSize: 10_000 },
    );

    return page.items.map((player) => player.id.value);
  }
}
