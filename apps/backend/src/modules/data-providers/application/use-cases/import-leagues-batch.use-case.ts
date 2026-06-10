import type { League } from '../../../leagues/domain/entities/league.entity';
import type { ImportLeaguesBatchCommand } from '../commands/import-leagues-batch.command';

import { type ImportLeagueUseCase } from './import-league.use-case';

export class ImportLeaguesBatchUseCase {
  constructor(private readonly importLeagueUseCase: ImportLeagueUseCase) {}

  async execute(command: ImportLeaguesBatchCommand): Promise<readonly League[]> {
    const leagues: League[] = [];

    for (const item of command.items) {
      const league = await this.importLeagueUseCase.execute(item);
      leagues.push(league);
    }

    return leagues;
  }
}
