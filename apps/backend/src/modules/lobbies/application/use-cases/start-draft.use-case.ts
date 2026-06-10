import { GetDraftSessionByLobbyUseCase } from '../../../draft/application/use-cases/get-draft-session-by-lobby.use-case';
import { InitializeDraftSessionUseCase } from '../../../draft/application/use-cases/initialize-draft-session.use-case';
import { DraftSessionAlreadyExistsError } from '../../../draft/domain/errors/draft.errors';
import type { StartLobbyCommand } from '../commands/lobby-ready.commands';
import { RoomEventName, type RoomEventPayload } from '../../domain/events/room.events';
import { RoomPhase } from '../../domain/enums/room-phase.enum';
import type { Lobby } from '../../domain/entities/lobby.entity';
import type { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import { SessionToken } from '../../domain/value-objects/session-token.vo';
import { LobbyLifecycleService } from '../services/lobby-lifecycle.service';
import type { RoomEventsPublisher } from '../services/room-events.publisher';

export interface StartDraftResult {
  readonly lobby: Lobby;
  readonly draftSessionId: string;
}

export class StartDraftUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    private readonly lobbyRepository: LobbyRepository,
    private readonly initializeDraftSessionUseCase: InitializeDraftSessionUseCase,
    private readonly getDraftSessionByLobbyUseCase: GetDraftSessionByLobbyUseCase,
    private readonly roomEventsPublisher: RoomEventsPublisher,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: StartLobbyCommand): Promise<StartDraftResult> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(command.code));

    lobby.startDraft(SessionToken.reconstitute(command.sessionToken));
    await this.lobbyRepository.save(lobby);

    const participantIds = lobby.participants.map((participant) => participant.id);

    let draftSessionId: string;
    try {
      const draftSession = await this.initializeDraftSessionUseCase.execute({
        lobbyId: lobby.id.value,
        participantIds,
      });
      draftSessionId = draftSession.id;
    } catch (error) {
      if (error instanceof DraftSessionAlreadyExistsError) {
        const existing = await this.getDraftSessionByLobbyUseCase.execute({ lobbyId: lobby.id.value });
        draftSessionId = existing?.id ?? lobby.id.value;
      } else {
        throw error;
      }
    }

    await this.roomEventsPublisher.publish(lobby.code.value, RoomEventName.DRAFT_READY, {
      lobbyCode: lobby.code.value,
      phase: RoomPhase.DRAFT,
      draftSessionId,
    } satisfies RoomEventPayload);

    return { lobby, draftSessionId };
  }
}
