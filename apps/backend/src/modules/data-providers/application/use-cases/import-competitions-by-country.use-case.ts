import type { League } from '../../../leagues/domain/entities/league.entity';

import type { ImportLeagueUseCase } from './import-league.use-case';
import type { ListCompetitionsByCountryUseCase } from './list-competitions-by-country.use-case';

export interface ImportCompetitionsByCountryCommand {
  readonly provider: string;
  readonly countryExternalId: string;
}

export class ImportCompetitionsByCountryUseCase {
  constructor(
    private readonly listCompetitionsByCountryUseCase: ListCompetitionsByCountryUseCase,
    private readonly importLeagueUseCase: ImportLeagueUseCase,
  ) {}

  async execute(command: ImportCompetitionsByCountryCommand): Promise<readonly League[]> {
    const competitions = await this.listCompetitionsByCountryUseCase.execute({
      provider: command.provider,
      countryExternalId: command.countryExternalId,
    });

    const leagues: League[] = [];

    for (const competition of competitions) {
      const league = await this.importLeagueUseCase.execute({
        provider: command.provider,
        slug: competition.slug,
        externalId: competition.externalId,
        name: competition.name,
        country: competition.country,
        countryExternalId: command.countryExternalId,
      });
      leagues.push(league);
    }

    return leagues;
  }
}
