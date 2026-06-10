import type { FormationRepository } from '../../../formations/domain/repositories/formation.repository';
import type { StartLobbyCommand } from '../commands/lobby-ready.commands';
import { RoomEventName, type RoomEventPayload } from '../../domain/events/room.events';
import { RoomPhase } from '../../domain/enums/room-phase.enum';
import type { Lobby } from '../../domain/entities/lobby.entity';
import type { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { FormationPoolService } from '../../domain/services/formation-pool.service';
import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import { SessionToken } from '../../domain/value-objects/session-token.vo';
import { LobbyLifecycleService } from '../services/lobby-lifecycle.service';
import type { RoomEventsPublisher } from '../services/room-events.publisher';

export interface StartLobbyResult {
  readonly lobby: Lobby;
}

export class StartLobbyUseCase {
  private readonly lifecycle: LobbyLifecycleService;
  private readonly formationPoolService = new FormationPoolService();

  constructor(
    private readonly lobbyRepository: LobbyRepository,
    private readonly formationRepository: FormationRepository,
    private readonly roomEventsPublisher: RoomEventsPublisher,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: StartLobbyCommand): Promise<StartLobbyResult> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(command.code));
    const allFormations = await this.formationRepository.findAll();
    const pools = this.formationPoolService.assignPersonalPools(
      lobby.id.value,
      lobby.participants.map((participant) => participant.id),
      allFormations,
    );

    const startedAt = new Date();
    lobby.startFormationSelection(
      SessionToken.reconstitute(command.sessionToken),
      pools,
      startedAt,
      null,
    );

    await this.lobbyRepository.save(lobby);

    await this.roomEventsPublisher.publish(lobby.code.value, RoomEventName.FORMATION_SELECTION_STARTED, {
      lobbyCode: lobby.code.value,
      phase: RoomPhase.FORMATION_SELECTION,
      participantCount: lobby.participants.length,
      formationSelectedCount: 0,
    } satisfies RoomEventPayload);

    return { lobby };
  }
}
