import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import type { Lobby } from '../../domain/entities/lobby.entity';
import type { LobbyRepository } from '../../domain/repositories/lobby.repository';
import type { GetLobbyByCodeQuery } from '../queries/get-lobby-by-code.query';
import { LobbyLifecycleService } from '../services/lobby-lifecycle.service';

export class GetLobbyByCodeUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(lobbyRepository: LobbyRepository) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(query: GetLobbyByCodeQuery): Promise<Lobby> {
    const code = LobbyCode.create(query.code);
    return this.lifecycle.requireActiveLobby(code);
  }
}
