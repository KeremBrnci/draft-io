import type { Formation } from '../../../formations/domain/entities/formation.entity';
import type { FormationRepository } from '../../../formations/domain/repositories/formation.repository';
import type { LobbyParticipant } from '../../domain/entities/lobby-participant.entity';
import type { Lobby } from '../../domain/entities/lobby.entity';
import { RoomEventName, type RoomEventPayload } from '../../domain/events/room.events';
import type { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import { SessionToken } from '../../domain/value-objects/session-token.vo';
import { LobbyLifecycleService } from '../services/lobby-lifecycle.service';
import type { RoomEventsPublisher } from '../services/room-events.publisher';

export interface SelectFormationCommand {
  readonly code: string;
  readonly sessionToken: string;
  readonly formationId: string;
}

export class SelectFormationUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    private readonly lobbyRepository: LobbyRepository,
    private readonly formationRepository: FormationRepository,
    private readonly roomEventsPublisher: RoomEventsPublisher,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: SelectFormationCommand): Promise<Lobby> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(command.code));
    const participant = lobby.selectFormation(
      SessionToken.reconstitute(command.sessionToken),
      command.formationId,
    );

    const formation = await this.formationRepository.findById(command.formationId);
    if (formation === null) {
      throw new Error(`Formation not found: ${command.formationId}`);
    }

    await this.lobbyRepository.save(lobby);

    await this.roomEventsPublisher.publish(
      lobby.code.value,
      RoomEventName.PLAYER_SELECTED_FORMATION,
      {
        lobbyCode: lobby.code.value,
        phase: lobby.phase,
        participantId: participant.id,
        formationId: formation.id,
        formationSelectedCount: lobby.formationSelectedCount,
        participantCount: lobby.participants.length,
      } satisfies RoomEventPayload,
    );

    if (lobby.allFormationsSelected) {
      await this.roomEventsPublisher.publish(
        lobby.code.value,
        RoomEventName.ALL_FORMATIONS_SELECTED,
        {
          lobbyCode: lobby.code.value,
          phase: lobby.phase,
          formationSelectedCount: lobby.formationSelectedCount,
          participantCount: lobby.participants.length,
        } satisfies RoomEventPayload,
      );
    }

    return lobby;
  }
}

export interface FormationSelectionState {
  readonly lobby: Lobby;
  readonly participant: LobbyParticipant | null;
  readonly myFormationOptions: readonly Formation[];
}

export interface GetFormationSelectionQuery {
  readonly code: string;
  readonly sessionToken?: string;
}

export class GetFormationSelectionUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    lobbyRepository: LobbyRepository,
    private readonly formationRepository: FormationRepository,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(query: GetFormationSelectionQuery): Promise<FormationSelectionState> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(query.code));
    const participant =
      query.sessionToken === undefined
        ? null
        : lobby.findParticipantBySessionToken(SessionToken.reconstitute(query.sessionToken));

    let myFormationOptions: readonly Formation[] = [];
    if (participant !== null) {
      const formations = await Promise.all(
        participant.formationOptionIds.map((formationId) =>
          this.formationRepository.findById(formationId),
        ),
      );
      myFormationOptions = formations.filter(
        (formation): formation is Formation => formation !== null,
      );
    }

    return { lobby, participant, myFormationOptions };
  }
}
