import { Lobby } from '../../domain/entities/lobby.entity';
import { LobbyParticipant } from '../../domain/entities/lobby-participant.entity';
import { generateLobbyCode } from '../../domain/services/lobby-code.generator';
import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import { LobbyId } from '../../domain/value-objects/lobby-id.vo';
import { LobbyName } from '../../domain/value-objects/lobby-name.vo';
import { ParticipantDisplayName } from '../../domain/value-objects/participant-display-name.vo';
import type { LobbyRepository } from '../../domain/repositories/lobby.repository';
import type { CreateLobbyCommand } from '../commands/create-lobby.command';
import type { LobbySession } from '../read-models/lobby-session';
import { LobbyLifecycleService } from '../services/lobby-lifecycle.service';

const DEFAULT_MAX_PLAYERS = 8;
const MAX_CODE_ATTEMPTS = 12;

export class CreateLobbyUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(private readonly lobbyRepository: LobbyRepository) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: CreateLobbyCommand): Promise<LobbySession> {
    const name = LobbyName.create(command.name);
    const displayName = ParticipantDisplayName.create(command.displayName);
    const maxPlayers = command.maxPlayers ?? DEFAULT_MAX_PLAYERS;
    const code = await this.generateUniqueCode();
    const host = LobbyParticipant.createHost(displayName);

    const lobby = Lobby.create({
      id: LobbyId.generate(),
      name,
      code,
      maxPlayers,
      host,
      expiresAt: this.lifecycle.initialExpiresAt(),
    });

    await this.lobbyRepository.save(lobby);

    return { lobby, participant: host };
  }

  private async generateUniqueCode(): Promise<LobbyCode> {
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
      const candidate = LobbyCode.create(generateLobbyCode());
      const exists = await this.lobbyRepository.existsByCode(candidate);

      if (!exists) {
        return candidate;
      }
    }

    throw new Error('Unable to generate unique lobby code');
  }
}
