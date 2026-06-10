import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { TeamSearchResult } from '../../domain/models/team-search-result';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';

export interface SearchTeamsQuery {
  readonly provider: string;
  readonly query: string;
}

export class SearchTeamsUseCase {
  constructor(private readonly providerRegistry: ProviderRegistryPort) {}

  execute(query: SearchTeamsQuery): Promise<readonly TeamSearchResult[]> {
    const provider = parseExternalProvider(query.provider);
    return this.providerRegistry.getTeamProvider(provider).searchTeams(query.query);
  }
}
