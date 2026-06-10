import type { SetParticipantReadyCommand } from '../commands/lobby-ready.commands';
import { GetDraftSessionByLobbyUseCase } from '../../../draft/application/use-cases/get-draft-session-by-lobby.use-case';
import { picksRemaining } from '../../../draft/domain/models/participant-draft-state';
import type { CheckDraftCompletionUseCase } from '../../../matches/application/use-cases/room-league.use-cases';
import { RoomPhase } from '../../domain/enums/room-phase.enum';
import { DraftRosterIncompleteError } from '../../domain/errors/lobby.errors';
import { RoomEventName, type RoomEventPayload } from '../../domain/events/room.events';
import type { Lobby } from '../../domain/entities/lobby.entity';
import type { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import { SessionToken } from '../../domain/value-objects/session-token.vo';
import { LobbyLifecycleService } from '../services/lobby-lifecycle.service';
import type { RoomEventsPublisher } from '../services/room-events.publisher';

export class SetParticipantReadyUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    private readonly lobbyRepository: LobbyRepository,
    private readonly getDraftSessionByLobbyUseCase: GetDraftSessionByLobbyUseCase,
    private readonly checkDraftCompletionUseCase: CheckDraftCompletionUseCase,
    private readonly roomEventsPublisher: RoomEventsPublisher,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: SetParticipantReadyCommand): Promise<Lobby> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(command.code));
    const sessionToken = SessionToken.reconstitute(command.sessionToken);

    if (lobby.phase === RoomPhase.DRAFT && command.isReady) {
      await this.assertParticipantRosterComplete(lobby, sessionToken);
    }

    const participant = lobby.setParticipantReady(sessionToken, command.isReady);
    this.lifecycle.touch(lobby);
    await this.lobbyRepository.save(lobby);

    if (lobby.phase === RoomPhase.DRAFT) {
      await this.roomEventsPublisher.publish(lobby.code.value, RoomEventName.DRAFT_PLAYER_READY, {
        lobbyCode: lobby.code.value,
        phase: lobby.phase,
        participantId: participant.id,
        participantCount: lobby.participants.length,
      } satisfies RoomEventPayload);

      await this.checkDraftCompletionUseCase.execute({ code: command.code });
    }

    return lobby;
  }

  private async assertParticipantRosterComplete(
    lobby: Lobby,
    sessionToken: SessionToken,
  ): Promise<void> {
    const participant = lobby.findParticipantBySessionToken(sessionToken);
    if (participant === null) {
      return;
    }

    const session = await this.getDraftSessionByLobbyUseCase.execute({ lobbyId: lobby.id.value });
    if (session === null) {
      throw new DraftRosterIncompleteError();
    }

    const draftState = session.participants.find((entry) => entry.participantId === participant.id);
    if (draftState === undefined || picksRemaining(draftState, session.rosterSize) > 0) {
      throw new DraftRosterIncompleteError();
    }
  }
}
