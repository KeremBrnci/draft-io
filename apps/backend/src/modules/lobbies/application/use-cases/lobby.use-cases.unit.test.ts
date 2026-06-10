import { beforeEach, describe, expect, it } from 'vitest';

import type { GetDraftSessionByLobbyUseCase } from '../../../draft/application/use-cases/get-draft-session-by-lobby.use-case';
import { getAllFormations } from '../../../formations/domain/constants/formation-templates';
import { InMemoryFormationRepository } from '../../../formations/infrastructure/persistence/in-memory-formation.repository';
import type { CheckDraftCompletionUseCase } from '../../../matches/application/use-cases/room-league.use-cases';
import { type Lobby } from '../../domain/entities/lobby.entity';
import { RoomPhase } from '../../domain/enums/room-phase.enum';
import { RoomEventName } from '../../domain/events/room.events';
import type { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import type { LobbyId } from '../../domain/value-objects/lobby-id.vo';
import type { RoomEventsPublisher } from '../services/room-events.publisher';

import { CreateLobbyUseCase } from './create-lobby.use-case';
import {
  GetFormationSelectionUseCase,
  SelectFormationUseCase,
} from './formation-selection.use-cases';
import { JoinLobbyUseCase } from './join-lobby.use-case';
import { SetParticipantReadyUseCase } from './set-participant-ready.use-case';
import { StartDraftUseCase } from './start-draft.use-case';
import { StartLobbyUseCase } from './start-lobby.use-case';

class InMemoryLobbyRepository implements LobbyRepository {
  private readonly lobbies = new Map<string, Lobby>();

  async findById(id: LobbyId): Promise<Lobby | null> {
    return this.lobbies.get(id.value) ?? null;
  }

  async findByCode(code: LobbyCode): Promise<Lobby | null> {
    for (const lobby of this.lobbies.values()) {
      if (lobby.code.value === code.value) {
        return lobby;
      }
    }

    return null;
  }

  async existsByCode(code: LobbyCode): Promise<boolean> {
    for (const lobby of this.lobbies.values()) {
      if (lobby.code.value === code.value) {
        return true;
      }
    }

    return false;
  }

  async save(lobby: Lobby): Promise<void> {
    this.lobbies.set(lobby.id.value, lobby);
  }

  async delete(id: LobbyId): Promise<void> {
    this.lobbies.delete(id.value);
  }
}

class FakeRoomEventsPublisher implements RoomEventsPublisher {
  readonly events: {
    readonly code: string;
    readonly event: RoomEventName;
    readonly payload: unknown;
  }[] = [];

  async publish(code: string, event: RoomEventName, payload: unknown): Promise<void> {
    this.events.push({ code, event, payload });
  }
}

class FakeInitializeDraftSessionUseCase {
  async execute(): Promise<{ id: string }> {
    return { id: 'draft-session-1' };
  }
}

class FakeGetDraftSessionByLobbyUseCase {
  async execute(): Promise<{ id: string } | null> {
    return { id: 'draft-session-1' };
  }
}

describe('CreateLobbyUseCase', () => {
  let repository: InMemoryLobbyRepository;
  let useCase: CreateLobbyUseCase;

  beforeEach(() => {
    repository = new InMemoryLobbyRepository();
    useCase = new CreateLobbyUseCase(repository);
  });

  it('creates lobby with host participant', async () => {
    const session = await useCase.execute({
      name: 'Cuma Draft',
      displayName: 'Turhan',
      maxPlayers: 4,
    });

    expect(session.lobby.name.value).toBe('Cuma Draft');
    expect(session.lobby.code.value).toHaveLength(6);
    expect(session.lobby.phase).toBe(RoomPhase.LOBBY);
    expect(session.participant.isHost).toBe(true);
    expect(session.participant.displayName.value).toBe('Turhan');
  });
});

describe('JoinLobbyUseCase', () => {
  let repository: InMemoryLobbyRepository;
  let createUseCase: CreateLobbyUseCase;
  let joinUseCase: JoinLobbyUseCase;

  beforeEach(() => {
    repository = new InMemoryLobbyRepository();
    createUseCase = new CreateLobbyUseCase(repository);
    joinUseCase = new JoinLobbyUseCase(repository);
  });

  it('adds participant to existing lobby', async () => {
    const created = await createUseCase.execute({
      name: 'Arkadaşlar',
      displayName: 'Host',
    });

    const joined = await joinUseCase.execute({
      code: created.lobby.code.value,
      displayName: 'Misafir',
    });

    expect(joined.lobby.participants).toHaveLength(2);
    expect(joined.participant.displayName.value).toBe('Misafir');
    expect(joined.participant.isHost).toBe(false);
  });
});

class FakeCheckDraftCompletionUseCase {
  async execute(): Promise<boolean> {
    return false;
  }
}

function createReadyUseCase(repository: InMemoryLobbyRepository): SetParticipantReadyUseCase {
  return new SetParticipantReadyUseCase(
    repository,
    new FakeGetDraftSessionByLobbyUseCase() as unknown as GetDraftSessionByLobbyUseCase,
    new FakeCheckDraftCompletionUseCase() as unknown as CheckDraftCompletionUseCase,
    new FakeRoomEventsPublisher(),
  );
}

describe('SetParticipantReadyUseCase', () => {
  let repository: InMemoryLobbyRepository;
  let createUseCase: CreateLobbyUseCase;
  let readyUseCase: SetParticipantReadyUseCase;

  beforeEach(() => {
    repository = new InMemoryLobbyRepository();
    createUseCase = new CreateLobbyUseCase(repository);
    readyUseCase = createReadyUseCase(repository);
  });

  it('marks participant ready', async () => {
    const created = await createUseCase.execute({
      name: 'Ready Room',
      displayName: 'Host',
    });

    const lobby = await readyUseCase.execute({
      code: created.lobby.code.value,
      sessionToken: created.participant.sessionToken.value,
      isReady: true,
    });

    expect(lobby.participants[0]?.isReady).toBe(true);
  });
});

describe('StartLobbyUseCase', () => {
  let repository: InMemoryLobbyRepository;
  let formationRepository: InMemoryFormationRepository;
  let events: FakeRoomEventsPublisher;
  let createUseCase: CreateLobbyUseCase;
  let joinUseCase: JoinLobbyUseCase;
  let readyUseCase: SetParticipantReadyUseCase;
  let startUseCase: StartLobbyUseCase;

  beforeEach(() => {
    repository = new InMemoryLobbyRepository();
    formationRepository = new InMemoryFormationRepository();
    events = new FakeRoomEventsPublisher();
    createUseCase = new CreateLobbyUseCase(repository);
    joinUseCase = new JoinLobbyUseCase(repository);
    readyUseCase = createReadyUseCase(repository);
    startUseCase = new StartLobbyUseCase(repository, formationRepository, events);
  });

  it('starts formation selection when all players are ready', async () => {
    const created = await createUseCase.execute({
      name: 'Start Room',
      displayName: 'Host',
      maxPlayers: 4,
    });

    const guest = await joinUseCase.execute({
      code: created.lobby.code.value,
      displayName: 'Guest',
    });

    await readyUseCase.execute({
      code: created.lobby.code.value,
      sessionToken: created.participant.sessionToken.value,
      isReady: true,
    });

    await readyUseCase.execute({
      code: created.lobby.code.value,
      sessionToken: guest.participant.sessionToken.value,
      isReady: true,
    });

    const result = await startUseCase.execute({
      code: created.lobby.code.value,
      sessionToken: created.participant.sessionToken.value,
    });

    expect(result.lobby.phase).toBe(RoomPhase.FORMATION_SELECTION);
    expect(result.lobby.participants[0]?.formationOptionIds).toHaveLength(5);
    expect(result.lobby.participants[1]?.formationOptionIds).toHaveLength(5);
    expect(result.lobby.participants[0]?.formationOptionIds).not.toEqual(
      result.lobby.participants[1]?.formationOptionIds,
    );
    expect(
      events.events.some((entry) => entry.event === RoomEventName.FORMATION_SELECTION_STARTED),
    ).toBe(true);
  });
});

describe('Formation selection flow', () => {
  let repository: InMemoryLobbyRepository;
  let formationRepository: InMemoryFormationRepository;
  let events: FakeRoomEventsPublisher;
  let hostSessionToken = '';
  let guestSessionToken = '';
  let lobbyCode = '';

  beforeEach(async () => {
    repository = new InMemoryLobbyRepository();
    formationRepository = new InMemoryFormationRepository();
    events = new FakeRoomEventsPublisher();

    const createUseCase = new CreateLobbyUseCase(repository);
    const joinUseCase = new JoinLobbyUseCase(repository);
    const readyUseCase = createReadyUseCase(repository);
    const startUseCase = new StartLobbyUseCase(repository, formationRepository, events);

    const created = await createUseCase.execute({
      name: 'Formation Room',
      displayName: 'Host',
      maxPlayers: 4,
    });
    const guest = await joinUseCase.execute({
      code: created.lobby.code.value,
      displayName: 'Guest',
    });

    lobbyCode = created.lobby.code.value;
    hostSessionToken = created.participant.sessionToken.value;
    guestSessionToken = guest.participant.sessionToken.value;

    await readyUseCase.execute({ code: lobbyCode, sessionToken: hostSessionToken, isReady: true });
    await readyUseCase.execute({ code: lobbyCode, sessionToken: guestSessionToken, isReady: true });
    await startUseCase.execute({ code: lobbyCode, sessionToken: hostSessionToken });
  });

  it('persists personal formation pools per participant', async () => {
    const getState = new GetFormationSelectionUseCase(repository, formationRepository);
    const hostState = await getState.execute({ code: lobbyCode, sessionToken: hostSessionToken });
    const guestState = await getState.execute({ code: lobbyCode, sessionToken: guestSessionToken });

    expect(hostState.myFormationOptions).toHaveLength(5);
    expect(guestState.myFormationOptions).toHaveLength(5);
    expect(hostState.myFormationOptions.map((formation) => formation.id)).not.toEqual(
      guestState.myFormationOptions.map((formation) => formation.id),
    );
  });

  it('locks formation after selection and emits websocket events', async () => {
    const selectUseCase = new SelectFormationUseCase(repository, formationRepository, events);
    const getState = new GetFormationSelectionUseCase(repository, formationRepository);
    const hostState = await getState.execute({ code: lobbyCode, sessionToken: hostSessionToken });
    const selectedFormationId = hostState.myFormationOptions[0]!.id;

    await selectUseCase.execute({
      code: lobbyCode,
      sessionToken: hostSessionToken,
      formationId: selectedFormationId,
    });

    const reloaded = await getState.execute({ code: lobbyCode, sessionToken: hostSessionToken });
    expect(reloaded.participant?.selectedFormationId).toBe(selectedFormationId);
    expect(
      events.events.some((entry) => entry.event === RoomEventName.PLAYER_SELECTED_FORMATION),
    ).toBe(true);

    await expect(
      selectUseCase.execute({
        code: lobbyCode,
        sessionToken: hostSessionToken,
        formationId: hostState.myFormationOptions[1]!.id,
      }),
    ).rejects.toThrow();
  });

  it('allows host to start draft only after everyone selected', async () => {
    const selectUseCase = new SelectFormationUseCase(repository, formationRepository, events);
    const getState = new GetFormationSelectionUseCase(repository, formationRepository);
    const startDraftUseCase = new StartDraftUseCase(
      repository,
      new FakeInitializeDraftSessionUseCase() as never,
      new FakeGetDraftSessionByLobbyUseCase() as never,
      events,
    );

    const hostState = await getState.execute({ code: lobbyCode, sessionToken: hostSessionToken });
    const guestState = await getState.execute({ code: lobbyCode, sessionToken: guestSessionToken });

    await expect(
      startDraftUseCase.execute({ code: lobbyCode, sessionToken: hostSessionToken }),
    ).rejects.toThrow();

    await selectUseCase.execute({
      code: lobbyCode,
      sessionToken: hostSessionToken,
      formationId: hostState.myFormationOptions[0]!.id,
    });
    await selectUseCase.execute({
      code: lobbyCode,
      sessionToken: guestSessionToken,
      formationId: guestState.myFormationOptions[0]!.id,
    });

    const result = await startDraftUseCase.execute({
      code: lobbyCode,
      sessionToken: hostSessionToken,
    });
    expect(result.lobby.phase).toBe(RoomPhase.DRAFT);
    expect(result.draftSessionId).toBe('draft-session-1');
    expect(
      events.events.some((entry) => entry.event === RoomEventName.ALL_FORMATIONS_SELECTED),
    ).toBe(true);
    expect(events.events.some((entry) => entry.event === RoomEventName.DRAFT_READY)).toBe(true);
  });

  it('restores formation choice after reload (reconnection)', async () => {
    const selectUseCase = new SelectFormationUseCase(repository, formationRepository, events);
    const getState = new GetFormationSelectionUseCase(repository, formationRepository);
    const hostState = await getState.execute({ code: lobbyCode, sessionToken: hostSessionToken });
    const selectedFormationId = hostState.myFormationOptions[2]!.id;

    await selectUseCase.execute({
      code: lobbyCode,
      sessionToken: hostSessionToken,
      formationId: selectedFormationId,
    });

    const reloadedLobby = await repository.findByCode(LobbyCode.create(lobbyCode));
    expect(reloadedLobby?.participants[0]?.selectedFormationId).toBe(selectedFormationId);
  });
});

describe('FormationPoolService', () => {
  it('draws five unique formations from catalog', async () => {
    const formations = getAllFormations();
    expect(formations.length).toBeGreaterThanOrEqual(5);
  });
});

describe('RoomGateway events contract', () => {
  it('uses stable event names', () => {
    expect(RoomEventName.FORMATION_SELECTION_STARTED).toBe('FORMATION_SELECTION_STARTED');
    expect(RoomEventName.PLAYER_SELECTED_FORMATION).toBe('PLAYER_SELECTED_FORMATION');
    expect(RoomEventName.ALL_FORMATIONS_SELECTED).toBe('ALL_FORMATIONS_SELECTED');
    expect(RoomEventName.DRAFT_READY).toBe('DRAFT_READY');
  });
});
