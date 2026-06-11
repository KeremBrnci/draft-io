import type { DraftSessionRepository } from '../../../draft/domain/repositories/draft-session.repository';
import { LobbyLifecycleService } from '../../../lobbies/application/services/lobby-lifecycle.service';
import type { RoomEventsPublisher } from '../../../lobbies/application/services/room-events.publisher';
import type { Lobby } from '../../../lobbies/domain/entities/lobby.entity';
import { RoomPhase } from '../../../lobbies/domain/enums/room-phase.enum';
import { InvalidLobbySessionError } from '../../../lobbies/domain/errors/lobby.errors';
import { RoomEventName } from '../../../lobbies/domain/events/room.events';
import type { LobbyRepository } from '../../../lobbies/domain/repositories/lobby.repository';
import type { RoomChatRepository } from '../../../lobbies/domain/repositories/room-chat.repository';
import { LobbyCode } from '../../../lobbies/domain/value-objects/lobby-code.vo';
import { SessionToken } from '../../../lobbies/domain/value-objects/session-token.vo';
import { LeagueNotCompletedError } from '../../domain/errors/league.errors';
import type { RoomLeagueRepository } from '../../domain/repositories/room-league.repository';

export class PlayAgainUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    private readonly lobbyRepository: LobbyRepository,
    private readonly roomLeagueRepository: RoomLeagueRepository,
    private readonly draftSessionRepository: DraftSessionRepository,
    private readonly roomChatRepository: RoomChatRepository,
    private readonly roomEventsPublisher: RoomEventsPublisher,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: { readonly code: string; readonly sessionToken: string }): Promise<Lobby> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(command.code));
    const participant = lobby.findParticipantBySessionToken(
      SessionToken.reconstitute(command.sessionToken),
    );
    if (participant === null) {
      throw new InvalidLobbySessionError();
    }

    const league = await this.roomLeagueRepository.findByLobbyId(lobby.id.value);
    if (league === null) {
      throw new LeagueNotCompletedError();
    }

    const seasonComplete = await this.roomLeagueRepository.isLeagueSeasonComplete(league.id);
    if (!seasonComplete) {
      throw new LeagueNotCompletedError();
    }

    await this.roomLeagueRepository.ensureLeagueCompleted(league.id);

    await this.roomLeagueRepository.deleteByLobbyId(lobby.id.value);
    await this.draftSessionRepository.deleteByLobbyId(lobby.id.value);
    await this.roomChatRepository.deleteByLobbyId(lobby.id.value);

    lobby.resetForPlayAgain();
    this.lifecycle.touch(lobby);
    await this.lobbyRepository.save(lobby);

    await this.roomEventsPublisher.publish(command.code, RoomEventName.LOBBY_RESET, {
      lobbyCode: command.code,
      phase: RoomPhase.LOBBY,
    });

    return lobby;
  }
}
