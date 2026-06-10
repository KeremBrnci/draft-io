import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { League } from '../../../leagues/domain/entities/league.entity';
import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import type { NationRepository } from '../../../nations/domain/repositories/nation.repository';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';
import type { ImportLeagueCommand } from '../commands/import-league.command';
import {
  applyExternalLeagueImport,
  mapExternalLeagueToDomain,
} from '../mappers/external-league-to-league.mapper';

export class ImportLeagueUseCase {
  constructor(
    private readonly providerRegistry: ProviderRegistryPort,
    private readonly leagueRepository: LeagueRepository,
    private readonly nationRepository: NationRepository,
  ) {}

  async execute(command: ImportLeagueCommand): Promise<League> {
    parseExternalProvider(command.provider);
    const leagueProvider = this.providerRegistry.getLeagueProvider(command.provider);

    const record = leagueProvider.buildRecordFromSearchResult(
      {
        slug: command.slug,
        externalId: command.externalId,
        name: command.name,
        country: command.country ?? null,
      },
      command.countryExternalId ?? null,
    );

    const existing = await this.leagueRepository.findByExternalReference(
      record.provider,
      record.externalId,
    );

    const context = {
      countryId: await this.resolveCountryId(
        command.countryExternalId ?? record.countryExternalId,
        record.provider,
      ),
    };

    const league =
      existing === null
        ? mapExternalLeagueToDomain(record, context)
        : applyExternalLeagueImport(existing, record, context);

    await this.leagueRepository.save(league);

    return league;
  }

  private async resolveCountryId(
    countryExternalId: string | null | undefined,
    provider: Parameters<LeagueRepository['findByExternalReference']>[0],
  ): Promise<string | null> {
    if (countryExternalId === null || countryExternalId === undefined) {
      return null;
    }

    const nation = await this.nationRepository.findByExternalReference(provider, countryExternalId);
    return nation?.id.value ?? null;
  }
}
