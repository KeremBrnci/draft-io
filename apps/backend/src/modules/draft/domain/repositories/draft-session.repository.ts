import type { DraftBalanceConfigDto } from '@draft-io/shared-types';

import type { ParticipantDraftState } from '../models/participant-draft-state';

export type DraftSessionStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';

export interface DraftSession {
  readonly id: string;
  readonly lobbyId: string;
  readonly status: DraftSessionStatus;
  readonly rosterSize: number;
  readonly config: DraftBalanceConfigDto;
  readonly participants: readonly ParticipantDraftState[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateDraftSessionInput {
  readonly lobbyId: string;
  readonly participantIds: readonly string[];
  readonly config?: DraftBalanceConfigDto;
}

export interface DraftSessionRepository {
  save(session: DraftSession): Promise<void>;
  findByLobbyId(lobbyId: string): Promise<DraftSession | null>;
  findById(id: string): Promise<DraftSession | null>;
  deleteByLobbyId(lobbyId: string): Promise<void>;
}

export const DRAFT_SESSION_REPOSITORY = Symbol('DRAFT_SESSION_REPOSITORY');
