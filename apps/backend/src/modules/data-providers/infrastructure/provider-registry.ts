import { Inject, Injectable } from '@nestjs/common';

import {
  ExternalProvider,
  parseExternalProvider,
} from '../../../core/external-reference/external-provider';
import { ProviderConfigurationError } from '../domain/errors/data-provider.errors';
import type { CountryProvider } from '../domain/ports/country-provider.port';
import type { LeagueProvider } from '../domain/ports/league-provider.port';
import type { PlayerProvider } from '../domain/ports/player-provider.port';
import type { ProviderRegistryPort } from '../domain/ports/provider-registry.port';
import type { TeamProvider } from '../domain/ports/team-provider.port';

import { SportDbLeagueProvider } from './sportdb/providers/sportdb-league.provider';
import { SportDbPlayerProvider } from './sportdb/providers/sportdb-player.provider';
import { SportDbTeamProvider } from './sportdb/providers/sportdb-team.provider';
import { TransfermarktCountryProvider } from './transfermarkt/providers/transfermarkt-country.provider';
import { TransfermarktLeagueProvider } from './transfermarkt/providers/transfermarkt-league.provider';
import { TransfermarktPlayerProvider } from './transfermarkt/providers/transfermarkt-player.provider';
import { TransfermarktTeamProvider } from './transfermarkt/providers/transfermarkt-team.provider';

@Injectable()
export class ProviderRegistry implements ProviderRegistryPort {
  constructor(
    @Inject(SportDbPlayerProvider) private readonly sportdbPlayer: SportDbPlayerProvider,
    @Inject(SportDbTeamProvider) private readonly sportdbTeam: SportDbTeamProvider,
    @Inject(SportDbLeagueProvider) private readonly sportdbLeague: SportDbLeagueProvider,
    @Inject(TransfermarktCountryProvider)
    private readonly transfermarktCountry: TransfermarktCountryProvider,
    @Inject(TransfermarktPlayerProvider)
    private readonly transfermarktPlayer: TransfermarktPlayerProvider,
    @Inject(TransfermarktTeamProvider)
    private readonly transfermarktTeam: TransfermarktTeamProvider,
    @Inject(TransfermarktLeagueProvider)
    private readonly transfermarktLeague: TransfermarktLeagueProvider,
  ) {}

  getPlayerProvider(provider: ExternalProvider | string): PlayerProvider {
    const parsed = typeof provider === 'string' ? parseExternalProvider(provider) : provider;

    switch (parsed) {
      case ExternalProvider.SPORTDB:
        return this.sportdbPlayer;
      case ExternalProvider.TRANSFERMARKT:
        return this.transfermarktPlayer;
      default:
        throw new ProviderConfigurationError(`No player provider registered for ${parsed}`);
    }
  }

  getTeamProvider(provider: ExternalProvider | string): TeamProvider {
    const parsed = typeof provider === 'string' ? parseExternalProvider(provider) : provider;

    switch (parsed) {
      case ExternalProvider.SPORTDB:
        return this.sportdbTeam;
      case ExternalProvider.TRANSFERMARKT:
        return this.transfermarktTeam;
      default:
        throw new ProviderConfigurationError(`No team provider registered for ${parsed}`);
    }
  }

  getLeagueProvider(provider: ExternalProvider | string): LeagueProvider {
    const parsed = typeof provider === 'string' ? parseExternalProvider(provider) : provider;

    switch (parsed) {
      case ExternalProvider.SPORTDB:
        return this.sportdbLeague;
      case ExternalProvider.TRANSFERMARKT:
        return this.transfermarktLeague;
      default:
        throw new ProviderConfigurationError(`No league provider registered for ${parsed}`);
    }
  }

  getCountryProvider(provider: ExternalProvider | string): CountryProvider {
    const parsed = typeof provider === 'string' ? parseExternalProvider(provider) : provider;

    if (parsed === ExternalProvider.TRANSFERMARKT) {
      return this.transfermarktCountry;
    }

    throw new ProviderConfigurationError(`No country provider registered for ${parsed}`);
  }
}
