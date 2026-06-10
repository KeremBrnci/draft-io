import type { Lobby } from '../../domain/entities/lobby.entity';
import { LobbyExpiredError, LobbyNotFoundError } from '../../domain/errors/lobby.errors';
import type { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { LobbyExpirationService } from '../../domain/services/lobby-expiration.service';
import type { LobbyCode } from '../../domain/value-objects/lobby-code.vo';

export class LobbyLifecycleService {
  private readonly expiration = new LobbyExpirationService();

  constructor(private readonly lobbyRepository: LobbyRepository) {}

  async requireActiveLobby(code: LobbyCode): Promise<Lobby> {
    const lobby = await this.lobbyRepository.findByCode(code);
    if (lobby === null) {
      throw new LobbyNotFoundError(code.value);
    }

    if (this.expiration.isExpired(lobby)) {
      await this.lobbyRepository.delete(lobby.id);
      throw new LobbyExpiredError(code.value);
    }

    return lobby;
  }

  touch(lobby: Lobby): void {
    this.expiration.touch(lobby);
  }

  initialExpiresAt(): Date {
    return this.expiration.initialExpiresAt();
  }
}
