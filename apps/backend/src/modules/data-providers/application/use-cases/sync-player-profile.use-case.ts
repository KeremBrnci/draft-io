import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { Player } from '../../../players/domain/entities/player.entity';
import { ExternalPlayerNotFoundError } from '../../domain/errors/data-provider.errors';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';
import type { ImportPlayerUseCase } from './import-player.use-case';

export interface SyncPlayerProfileCommand {
  readonly provider: string;
  readonly externalId: string;
  readonly slug?: string;
}

/** Re-imports player profile data from provider (idempotent update). */
export class SyncPlayerProfileUseCase {
  constructor(
    private readonly providerRegistry: ProviderRegistryPort,
    private readonly importPlayerUseCase: ImportPlayerUseCase,
  ) {}

  async execute(command: SyncPlayerProfileCommand): Promise<Player> {
    const provider = parseExternalProvider(command.provider);
    const playerProvider = this.providerRegistry.getPlayerProvider(provider);

    if (playerProvider.fetchProfile === undefined) {
      throw new ExternalPlayerNotFoundError(command.externalId);
    }

    const record = await playerProvider.fetchProfile(command.externalId);

    if (record === null) {
      throw new ExternalPlayerNotFoundError(command.externalId);
    }

    return this.importPlayerUseCase.execute({
      provider: command.provider,
      slug: command.slug ?? record.slug,
      externalId: command.externalId,
    });
  }
}
