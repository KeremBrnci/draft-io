import { v4 as uuidv4 } from 'uuid';

import type { InitializeDraftSessionCommand } from '../commands/initialize-draft-session.command';
import { DEFAULT_DRAFT_BALANCE_CONFIG } from '../../domain/config/default-draft-balance.config';
import { DraftSessionAlreadyExistsError } from '../../domain/errors/draft.errors';
import type { DraftSession } from '../../domain/repositories/draft-session.repository';
import type { DraftSessionRepository } from '../../domain/repositories/draft-session.repository';
import { createParticipantDraftState } from '../../domain/models/participant-draft-state';
import type { RandomSource } from '../../domain/ports/random-source.port';
import { BudgetAllocator } from '../../domain/services/budget-allocator.service';

export class InitializeDraftSessionUseCase {
  constructor(
    private readonly draftSessionRepository: DraftSessionRepository,
    private readonly random: RandomSource,
  ) {}

  async execute(command: InitializeDraftSessionCommand): Promise<DraftSession> {
    const existing = await this.draftSessionRepository.findByLobbyId(command.lobbyId);
    if (existing !== null) {
      throw new DraftSessionAlreadyExistsError(command.lobbyId);
    }

    const config = command.config ?? DEFAULT_DRAFT_BALANCE_CONFIG;
    const budgetAllocator = new BudgetAllocator(config, this.random);
    const budgets = budgetAllocator.allocateForParticipants(command.participantIds);

    const now = new Date();
    const session: DraftSession = {
      id: uuidv4(),
      lobbyId: command.lobbyId,
      status: 'ACTIVE',
      rosterSize: config.rosterSize,
      config,
      participants: command.participantIds.map((participantId) =>
        createParticipantDraftState({
          participantId,
          powerBudget: budgets.get(participantId) ?? config.targetTeamAverageOverall * config.rosterSize,
        }),
      ),
      createdAt: now,
      updatedAt: now,
    };

    await this.draftSessionRepository.save(session);
    return session;
  }
}
