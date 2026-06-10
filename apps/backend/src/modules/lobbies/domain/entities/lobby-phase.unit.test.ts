import { describe, expect, it } from 'vitest';

import { LobbyParticipant } from '../../domain/entities/lobby-participant.entity';
import { ParticipantPhaseStatus, RoomPhase } from '../../domain/enums/room-phase.enum';
import { LobbyStatus } from '../../domain/enums/lobby-status.enum';
import { Lobby } from '../../domain/entities/lobby.entity';
import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import { LobbyId } from '../../domain/value-objects/lobby-id.vo';
import { LobbyName } from '../../domain/value-objects/lobby-name.vo';
import { ParticipantDisplayName } from '../../domain/value-objects/participant-display-name.vo';
import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import { FormationPoolService } from '../../domain/services/formation-pool.service';
import { getAllFormations } from '../../../formations/domain/constants/formation-templates';

describe('Lobby room phase machine', () => {
  const poolService = new FormationPoolService();

  function buildReadyLobby(): Lobby {
    const host = LobbyParticipant.createHost(ParticipantDisplayName.create('Host'));
    const guest = LobbyParticipant.createGuest(ParticipantDisplayName.create('Guest'));
    host.setReady(true);
    guest.setReady(true);

    return Lobby.reconstitute({
      id: LobbyId.generate(),
      name: LobbyName.create('Phase Room'),
      code: LobbyCode.create('A2B3C4'),
      status: LobbyStatus.FULL,
      phase: RoomPhase.LOBBY,
      maxPlayers: 4,
      participants: [host, guest],
      expiresAt: new Date(Date.now() + 60_000),
      formationSelectionStartedAt: null,
      formationSelectionDeadline: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  it('transitions LOBBY -> FORMATION_SELECTION -> DRAFT', () => {
    const lobby = buildReadyLobby();
    const pools = poolService.assignPersonalPools(
      lobby.id.value,
      lobby.participants.map((participant) => participant.id),
      getAllFormations(),
    );

    lobby.startFormationSelection(
      lobby.participants[0]!.sessionToken,
      pools,
      new Date(),
      null,
    );
    expect(lobby.phase).toBe(RoomPhase.FORMATION_SELECTION);

    const hostPool = lobby.participants[0]!.formationOptionIds;
    lobby.selectFormation(lobby.participants[0]!.sessionToken, hostPool[0]!);
    lobby.selectFormation(lobby.participants[1]!.sessionToken, lobby.participants[1]!.formationOptionIds[0]!);

    expect(lobby.allFormationsSelected).toBe(true);
    lobby.startDraft(lobby.participants[0]!.sessionToken);
    expect(lobby.phase).toBe(RoomPhase.DRAFT);
  });

  it('marks participant as FORMATION_SELECTED after pick', () => {
    const lobby = buildReadyLobby();
    const pools = poolService.assignPersonalPools(
      lobby.id.value,
      lobby.participants.map((participant) => participant.id),
      getAllFormations(),
    );
    lobby.startFormationSelection(lobby.participants[0]!.sessionToken, pools, new Date(), null);

    const formationId = lobby.participants[0]!.formationOptionIds[0]!;
    lobby.selectFormation(lobby.participants[0]!.sessionToken, formationId);

    expect(lobby.participants[0]?.phaseStatus).toBe(ParticipantPhaseStatus.FORMATION_SELECTED);
    expect(lobby.participants[0]?.selectedFormationId).toBe(formationId);
  });
});
