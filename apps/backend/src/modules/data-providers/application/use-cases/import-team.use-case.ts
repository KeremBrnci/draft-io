import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import type { NationRepository } from '../../../nations/domain/repositories/nation.repository';
import type { Team } from '../../../teams/domain/entities/team.entity';
import type { TeamRepository } from '../../../teams/domain/repositories/team.repository';
import { ExternalTeamNotFoundError } from '../../domain/errors/data-provider.errors';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';
import type { ImportTeamCommand } from '../commands/import-team.command';
import {
  applyExternalTeamImport,
  mapExternalTeamToDomain,
} from '../mappers/external-team-to-team.mapper';

export class ImportTeamUseCase {
  constructor(
    private readonly providerRegistry: ProviderRegistryPort,
    private readonly teamRepository: TeamRepository,
    private readonly leagueRepository: LeagueRepository,
    private readonly nationRepository: NationRepository,
  ) {}

  async execute(command: ImportTeamCommand): Promise<Team> {
    const provider = parseExternalProvider(command.provider);
    const teamProvider = this.providerRegistry.getTeamProvider(provider);

    const record = await teamProvider.fetchBySlugAndId(command.slug, command.externalId);

    if (record === null) {
      throw new ExternalTeamNotFoundError(command.externalId);
    }

    const existing = await this.teamRepository.findByExternalReference(
      record.provider,
      record.externalId,
    );

    const context = {
      countryId: await this.resolveCountryId(record.countryExternalId, record.provider),
      leagueId: await this.resolveLeagueId(record.leagueExternalId, record.provider),
    };

    const team =
      existing === null
        ? mapExternalTeamToDomain(record, context)
        : applyExternalTeamImport(existing, record, context);

    await this.teamRepository.save(team);

    return team;
  }

  private async resolveCountryId(
    countryExternalId: string | null,
    provider: Parameters<TeamRepository['findByExternalReference']>[0],
  ): Promise<string | null> {
    if (countryExternalId === null) {
      return null;
    }

    const nation = await this.nationRepository.findByExternalReference(provider, countryExternalId);
    return nation?.id.value ?? null;
  }

  private async resolveLeagueId(
    leagueExternalId: string | null,
    provider: Parameters<TeamRepository['findByExternalReference']>[0],
  ): Promise<string | null> {
    if (leagueExternalId === null) {
      return null;
    }

    const league = await this.leagueRepository.findByExternalReference(provider, leagueExternalId);
    return league?.id.value ?? null;
  }
}
