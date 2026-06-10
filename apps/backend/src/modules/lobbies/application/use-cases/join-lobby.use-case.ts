import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import { ParticipantDisplayName } from '../../domain/value-objects/participant-display-name.vo';
import type { LobbyRepository } from '../../domain/repositories/lobby.repository';
import type { JoinLobbyCommand } from '../commands/join-lobby.command';
import type { LobbySession } from '../read-models/lobby-session';
import { LobbyLifecycleService } from '../services/lobby-lifecycle.service';

export class JoinLobbyUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(private readonly lobbyRepository: LobbyRepository) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: JoinLobbyCommand): Promise<LobbySession> {
    const code = LobbyCode.create(command.code);
    const displayName = ParticipantDisplayName.create(command.displayName);

    const lobby = await this.lifecycle.requireActiveLobby(code);
    const participant = lobby.join(displayName);
    this.lifecycle.touch(lobby);
    await this.lobbyRepository.save(lobby);

    return { lobby, participant };
  }
}
