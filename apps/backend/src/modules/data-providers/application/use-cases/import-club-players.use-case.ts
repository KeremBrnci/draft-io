import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { Player } from '../../../players/domain/entities/player.entity';
import type { TeamRepository } from '../../../teams/domain/repositories/team.repository';
import { ProviderConfigurationError } from '../../domain/errors/data-provider.errors';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';
import type { ImportPlayerUseCase } from './import-player.use-case';

export interface ImportClubPlayersCommand {
  readonly provider: string;
  readonly clubExternalId: string;
  readonly leagueExternalId?: string | null;
}

export interface ImportClubPlayerFailure {
  readonly externalId: string;
  readonly displayName: string;
}

export interface ImportClubPlayersResult {
  readonly imported: number;
  readonly failed: number;
  readonly failedPlayers: readonly ImportClubPlayerFailure[];
  readonly players: readonly Player[];
}

export class ImportClubPlayersUseCase {
  constructor(
    private readonly providerRegistry: ProviderRegistryPort,
    private readonly teamRepository: TeamRepository,
    private readonly importPlayerUseCase: ImportPlayerUseCase,
  ) {}

  async execute(command: ImportClubPlayersCommand): Promise<ImportClubPlayersResult> {
    const provider = parseExternalProvider(command.provider);
    const playerProvider = this.providerRegistry.getPlayerProvider(command.provider);

    if (playerProvider.fetchClubPlayers === undefined) {
      throw new ProviderConfigurationError(
        `Provider ${command.provider} does not support club player roster import`,
      );
    }

    const team = await this.teamRepository.findByExternalReference(provider, command.clubExternalId);
    const leagueExternalId = command.leagueExternalId ?? null;

    const records = await playerProvider.fetchClubPlayers(
      command.clubExternalId,
      leagueExternalId,
    );

    const players: Player[] = [];
    const failedPlayers: ImportClubPlayerFailure[] = [];
    const mappingContext = {
      teamId: team?.id.value ?? null,
      ...(team?.leagueId !== null && team?.leagueId !== undefined
        ? { leagueId: team.leagueId }
        : {}),
    };

    for (const record of records) {
      try {
        const player = await this.importPlayerUseCase.upsertFromRecord(record, mappingContext);
        players.push(player);
      } catch {
        const recovered = await this.tryImportFromProfile(
          playerProvider,
          record.externalId,
          mappingContext,
        );

        if (recovered !== null) {
          players.push(recovered);
          continue;
        }

        failedPlayers.push({
          externalId: record.externalId,
          displayName: record.displayName,
        });
      }
    }

    return {
      imported: players.length,
      failed: failedPlayers.length,
      failedPlayers,
      players,
    };
  }

  private async tryImportFromProfile(
    playerProvider: ReturnType<ProviderRegistryPort['getPlayerProvider']>,
    externalId: string,
    mappingContext: {
      readonly teamId: string | null;
      readonly leagueId?: string;
    },
  ): Promise<Player | null> {
    if (playerProvider.fetchProfile === undefined) {
      return null;
    }

    try {
      const profile = await playerProvider.fetchProfile(externalId);

      if (profile === null) {
        return null;
      }

      return await this.importPlayerUseCase.upsertFromRecord(profile, mappingContext);
    } catch {
      return null;
    }
  }
}
