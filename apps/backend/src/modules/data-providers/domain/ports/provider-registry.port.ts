import type { ExternalProvider } from '../../../../core/external-reference/external-provider';

import type { CountryProvider } from './country-provider.port';
import type { LeagueProvider } from './league-provider.port';
import type { PlayerProvider } from './player-provider.port';
import type { TeamProvider } from './team-provider.port';

export interface ProviderRegistryPort {
  getPlayerProvider(provider: ExternalProvider | string): PlayerProvider;
  getTeamProvider(provider: ExternalProvider | string): TeamProvider;
  getLeagueProvider(provider: ExternalProvider | string): LeagueProvider;
  getCountryProvider(provider: ExternalProvider | string): CountryProvider;
}

export const PROVIDER_REGISTRY = Symbol('PROVIDER_REGISTRY');
