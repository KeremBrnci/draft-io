import { describe, expect, it } from 'vitest';

import { LobbyParticipant } from '../../domain/entities/lobby-participant.entity';
import { Lobby } from '../../domain/entities/lobby.entity';
import { LobbyStatus } from '../../domain/enums/lobby-status.enum';
import { RoomPhase } from '../../domain/enums/room-phase.enum';
import {
  LOBBY_INACTIVITY_TTL_MS,
  LobbyExpirationService,
} from '../../domain/services/lobby-expiration.service';
import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import { LobbyId } from '../../domain/value-objects/lobby-id.vo';
import { LobbyName } from '../../domain/value-objects/lobby-name.vo';
import { ParticipantDisplayName } from '../../domain/value-objects/participant-display-name.vo';

function buildLobby(expiresAt: Date) {
  const host = LobbyParticipant.createHost(ParticipantDisplayName.create('Host'));
  return Lobby.create({
    id: LobbyId.generate(),
    name: LobbyName.create('Test'),
    code: LobbyCode.create('A2B3C4'),
    maxPlayers: 4,
    host,
    expiresAt,
  });
}

describe('LobbyExpirationService', () => {
  const service = new LobbyExpirationService();

  it('marks open lobby expired after expiresAt', () => {
    const lobby = buildLobby(new Date(Date.now() - 1_000));
    expect(service.isExpired(lobby)).toBe(true);
  });

  it('extends expiry on touch without exceeding max lifetime', () => {
    const createdAt = new Date();
    const lobby = buildLobby(new Date(createdAt.getTime() + LOBBY_INACTIVITY_TTL_MS));
    service.touch(lobby);
    expect(lobby.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('does not expire started lobby', () => {
    const host = LobbyParticipant.createHost(ParticipantDisplayName.create('Host'));
    const guest = LobbyParticipant.createHost(ParticipantDisplayName.create('Guest'));
    const lobby = Lobby.reconstitute({
      id: LobbyId.generate(),
      name: LobbyName.create('Test'),
      code: LobbyCode.create('A2B3C4'),
      status: LobbyStatus.STARTED,
      phase: RoomPhase.FORMATION_SELECTION,
      maxPlayers: 4,
      draftLeagueIds: [],
      participants: [host, guest],
      expiresAt: new Date(Date.now() - 1_000),
      formationSelectionStartedAt: new Date(),
      formationSelectionDeadline: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(service.isExpired(lobby)).toBe(false);
  });
});
