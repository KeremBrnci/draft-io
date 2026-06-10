import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { LeagueSearchResult } from '../../domain/models/league-search-result';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';

export interface SearchLeaguesQuery {
  readonly provider: string;
  readonly query: string;
}

export class SearchLeaguesUseCase {
  constructor(private readonly providerRegistry: ProviderRegistryPort) {}

  execute(query: SearchLeaguesQuery): Promise<readonly LeagueSearchResult[]> {
    const provider = parseExternalProvider(query.provider);
    return this.providerRegistry.getLeagueProvider(provider).searchLeagues(query.query);
  }
}
