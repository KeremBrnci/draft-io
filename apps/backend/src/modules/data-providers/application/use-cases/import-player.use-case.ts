import {
  ExternalProvider,
  parseExternalProvider,
} from '../../../../core/external-reference/external-provider';
import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import type { Player } from '../../../players/domain/entities/player.entity';
import type { PlayerRepository } from '../../../players/domain/repositories/player.repository';
import type { TeamRepository } from '../../../teams/domain/repositories/team.repository';
import { TeamId } from '../../../teams/domain/value-objects/team-id.vo';
import { ExternalPlayerNotFoundError } from '../../domain/errors/data-provider.errors';
import type { ExternalPlayerRecord } from '../../domain/models/external-player-record';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';
import type { ImportPlayerCommand } from '../commands/import-player.command';
import {
  applyExternalPlayerImport,
  mapExternalPlayerToDomain,
  type ExternalPlayerMappingContext,
} from '../mappers/external-player-to-player.mapper';

/**
 * Upserts player identity from external providers.
 * Does not create or update Card records — gameplay assets are game-owned.
 */
export class ImportPlayerUseCase {
  constructor(
    private readonly providerRegistry: ProviderRegistryPort,
    private readonly playerRepository: PlayerRepository,
    private readonly teamRepository: TeamRepository,
    private readonly leagueRepository: LeagueRepository,
  ) {}

  async execute(command: ImportPlayerCommand): Promise<Player> {
    const provider = parseExternalProvider(command.provider);
    const playerProvider = this.providerRegistry.getPlayerProvider(provider);

    const record =
      provider === ExternalProvider.TRANSFERMARKT && playerProvider.fetchProfile !== undefined
        ? await playerProvider.fetchProfile(command.externalId)
        : await playerProvider.fetchBySlugAndId(command.slug, command.externalId);

    if (record === null) {
      throw new ExternalPlayerNotFoundError(command.externalId);
    }

    return this.upsertFromRecord(record);
  }

  /** Upserts from an already-fetched provider record (no external API call). */
  async upsertFromRecord(
    record: ExternalPlayerRecord,
    overrides: Partial<ExternalPlayerMappingContext> = {},
  ): Promise<Player> {
    const existing = await this.playerRepository.findByExternalReference(
      record.provider,
      record.externalId,
    );

    const teamId =
      overrides.teamId !== undefined
        ? overrides.teamId
        : await this.resolveTeamId(record.teamExternalId, record.provider);

    const context: ExternalPlayerMappingContext = {
      countryId: overrides.countryId ?? null,
      teamId,
      leagueId: await this.resolveLeagueIdForImport(record, overrides, teamId),
    };

    const player =
      existing === null
        ? mapExternalPlayerToDomain(record, context)
        : applyExternalPlayerImport(existing, record, context);

    await this.playerRepository.save(player);

    return player;
  }

  private async resolveTeamId(
    teamExternalId: string | null,
    provider: Parameters<PlayerRepository['findByExternalReference']>[0],
  ): Promise<string | null> {
    if (teamExternalId === null) {
      return null;
    }

    const team = await this.teamRepository.findByExternalReference(provider, teamExternalId);
    return team?.id.value ?? null;
  }

  private async resolveLeagueId(
    leagueExternalId: string | null,
    provider: Parameters<PlayerRepository['findByExternalReference']>[0],
  ): Promise<string | null> {
    if (leagueExternalId === null) {
      return null;
    }

    const league = await this.leagueRepository.findByExternalReference(provider, leagueExternalId);
    return league?.id.value ?? null;
  }

  private async resolveLeagueIdForImport(
    record: ExternalPlayerRecord,
    overrides: Partial<ExternalPlayerMappingContext>,
    teamId: string | null,
  ): Promise<string | null> {
    if (overrides.leagueId !== undefined && overrides.leagueId !== null) {
      return overrides.leagueId;
    }

    const fromRecord = await this.resolveLeagueId(record.leagueExternalId, record.provider);
    if (fromRecord !== null) {
      return fromRecord;
    }

    return this.resolveLeagueIdFromTeam(teamId);
  }

  private async resolveLeagueIdFromTeam(teamId: string | null): Promise<string | null> {
    if (teamId === null) {
      return null;
    }

    const team = await this.teamRepository.findById(TeamId.create(teamId));
    return team?.leagueId ?? null;
  }
}
