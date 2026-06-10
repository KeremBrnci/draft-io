import { beforeEach, describe, expect, it } from 'vitest';

import type { DraftPoolRepository } from '../../domain/repositories/draft-pool.repository';
import type { DraftSession } from '../../domain/repositories/draft-session.repository';
import type { DraftSessionRepository } from '../../domain/repositories/draft-session.repository';
import { SeededRandomSource } from '../../infrastructure/random/seeded-random-source';
import { buildTestDraftPoolCard, buildTestPool } from '../../testing/draft-test.factory';

import { ApplyDraftPickUseCase } from './apply-draft-pick.use-case';
import { GeneratePickOptionsUseCase } from './generate-pick-options.use-case';
import { InitializeDraftSessionUseCase } from './initialize-draft-session.use-case';

class InMemoryDraftSessionRepository implements DraftSessionRepository {
  private sessions = new Map<string, DraftSession>();

  async save(session: DraftSession): Promise<void> {
    this.sessions.set(session.lobbyId, session);
  }

  async findByLobbyId(lobbyId: string): Promise<DraftSession | null> {
    return this.sessions.get(lobbyId) ?? null;
  }

  async findById(id: string): Promise<DraftSession | null> {
    return [...this.sessions.values()].find((session) => session.id === id) ?? null;
  }
}

class InMemoryDraftPoolRepository implements DraftPoolRepository {
  constructor(private readonly pool: readonly ReturnType<typeof buildTestDraftPoolCard>[]) {}

  async findEligibleCards(query: {
    positionCode: string;
    excludeCardIds?: readonly string[];
    excludePlayerIds?: readonly string[];
  }) {
    const excludeCardIds = new Set(query.excludeCardIds ?? []);
    const excludePlayerIds = new Set(query.excludePlayerIds ?? []);
    return this.pool.filter(
      (card) =>
        !excludeCardIds.has(card.cardId) &&
        !excludePlayerIds.has(card.playerId) &&
        card.positions.some(
          (position: { positionCode: string }) => position.positionCode === query.positionCode,
        ),
    );
  }

  async findByIds(cardIds: readonly string[]) {
    return this.pool.filter((card) => cardIds.includes(card.cardId));
  }
}

describe('Draft balance use cases', () => {
  let sessionRepository: InMemoryDraftSessionRepository;
  let poolRepository: InMemoryDraftPoolRepository;
  let initializeUseCase: InitializeDraftSessionUseCase;
  let generateOptionsUseCase: GeneratePickOptionsUseCase;
  let applyPickUseCase: ApplyDraftPickUseCase;

  beforeEach(() => {
    sessionRepository = new InMemoryDraftSessionRepository();
    poolRepository = new InMemoryDraftPoolRepository(buildTestPool());
    initializeUseCase = new InitializeDraftSessionUseCase(
      sessionRepository,
      new SeededRandomSource(1),
    );
    generateOptionsUseCase = new GeneratePickOptionsUseCase(
      sessionRepository,
      poolRepository,
      new SeededRandomSource(2),
    );
    applyPickUseCase = new ApplyDraftPickUseCase(sessionRepository, poolRepository);
  });

  it('initializes hidden budgets for all participants', async () => {
    const session = await initializeUseCase.execute({
      lobbyId: 'lobby-1',
      participantIds: ['p1', 'p2'],
    });

    expect(session.participants).toHaveLength(2);
    expect(session.participants[0]?.powerBudget).toBeGreaterThan(900);
    expect(session.participants[1]?.powerBudget).toBeGreaterThan(900);
  });

  it('generates pick options and applies a pick', async () => {
    await initializeUseCase.execute({
      lobbyId: 'lobby-1',
      participantIds: ['p1'],
    });

    const options = await generateOptionsUseCase.execute({
      lobbyId: 'lobby-1',
      participantId: 'p1',
      positionCode: 'CM',
    });

    expect(options.options.length).toBeGreaterThan(0);

    const firstOption = options.options[0];
    expect(firstOption).toBeDefined();

    const updated = await applyPickUseCase.execute({
      lobbyId: 'lobby-1',
      participantId: 'p1',
      cardId: firstOption!.cardId,
      positionCode: 'CM',
    });

    expect(updated.participants[0]?.pickCount).toBe(1);
    expect(updated.participants[0]?.draftedCardIds).toContain(firstOption!.cardId);
  });

  it('accepts alternate formation positions when applying a pick', async () => {
    const cfOnlyPool = [
      buildTestDraftPoolCard({
        cardId: 'cf-1',
        overall: 84,
        displayName: 'Centre Forward',
        positions: [{ positionCode: 'CF', isPrimary: true, sortOrder: 0 }],
      }),
    ];
    const cfPoolRepository = new InMemoryDraftPoolRepository(cfOnlyPool);
    const cfApplyUseCase = new ApplyDraftPickUseCase(sessionRepository, cfPoolRepository);

    await initializeUseCase.execute({
      lobbyId: 'lobby-1',
      participantIds: ['p1'],
    });

    const updated = await cfApplyUseCase.execute({
      lobbyId: 'lobby-1',
      participantId: 'p1',
      cardId: 'cf-1',
      positionCode: 'ST',
      positionCodes: ['ST', 'CF'],
      slotAssignment: {
        slotIndex: 10,
        slotLabel: 'ST',
      },
    });

    expect(updated.participants[0]?.pickCount).toBe(1);
    expect(updated.participants[0]?.slotAssignments[0]?.slotLabel).toBe('ST');
  });

  it('rejects drafting the same player twice via a different card', async () => {
    const duplicatePlayerPool = [
      buildTestDraftPoolCard({
        cardId: 'player-card-1',
        playerId: 'shared-player',
        overall: 88,
        displayName: 'Shared Player',
      }),
      buildTestDraftPoolCard({
        cardId: 'player-card-2',
        playerId: 'shared-player',
        overall: 87,
        displayName: 'Shared Player Alt',
      }),
    ];
    const duplicatePoolRepository = new InMemoryDraftPoolRepository(duplicatePlayerPool);
    const duplicateApplyUseCase = new ApplyDraftPickUseCase(
      sessionRepository,
      duplicatePoolRepository,
    );

    await initializeUseCase.execute({
      lobbyId: 'lobby-1',
      participantIds: ['p1'],
    });

    await duplicateApplyUseCase.execute({
      lobbyId: 'lobby-1',
      participantId: 'p1',
      cardId: 'player-card-1',
      positionCode: 'CM',
    });

    await expect(
      duplicateApplyUseCase.execute({
        lobbyId: 'lobby-1',
        participantId: 'p1',
        cardId: 'player-card-2',
        positionCode: 'CM',
      }),
    ).rejects.toThrow('Player already drafted');
  });
});
