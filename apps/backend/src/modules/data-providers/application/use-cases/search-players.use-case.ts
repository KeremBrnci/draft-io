import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { PlayerSearchResult } from '../../domain/models/player-search-result';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';

export interface SearchPlayersQuery {
  readonly provider: string;
  readonly query: string;
}

export class SearchPlayersUseCase {
  constructor(private readonly providerRegistry: ProviderRegistryPort) {}

  execute(query: SearchPlayersQuery): Promise<readonly PlayerSearchResult[]> {
    const provider = parseExternalProvider(query.provider);
    return this.providerRegistry.getPlayerProvider(provider).searchPlayers(query.query);
  }
}
