import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import { ProviderConfigurationError } from '../../domain/errors/data-provider.errors';
import type { LeagueSearchResult } from '../../domain/models/league-search-result';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';

export interface ListCompetitionsByCountryQuery {
  readonly provider: string;
  readonly countryExternalId: string;
}

export class ListCompetitionsByCountryUseCase {
  constructor(private readonly providerRegistry: ProviderRegistryPort) {}

  async execute(query: ListCompetitionsByCountryQuery): Promise<readonly LeagueSearchResult[]> {
    parseExternalProvider(query.provider);
    const leagueProvider = this.providerRegistry.getLeagueProvider(query.provider);

    if (leagueProvider.listCompetitionsByCountry === undefined) {
      throw new ProviderConfigurationError(
        `Provider ${query.provider} does not support listing competitions by country`,
      );
    }

    return leagueProvider.listCompetitionsByCountry(query.countryExternalId);
  }
}
