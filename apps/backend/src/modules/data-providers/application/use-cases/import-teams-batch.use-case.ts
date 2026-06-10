import type { Team } from '../../../teams/domain/entities/team.entity';
import type { ImportTeamsBatchCommand } from '../commands/import-teams-batch.command';

import { type ImportTeamUseCase } from './import-team.use-case';

export class ImportTeamsBatchUseCase {
  constructor(private readonly importTeamUseCase: ImportTeamUseCase) {}

  async execute(command: ImportTeamsBatchCommand): Promise<readonly Team[]> {
    const teams: Team[] = [];

    for (const item of command.items) {
      const team = await this.importTeamUseCase.execute(item);
      teams.push(team);
    }

    return teams;
  }
}
