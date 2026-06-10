import type { DraftSession } from '../../domain/repositories/draft-session.repository';
import type { DraftSessionRepository } from '../../domain/repositories/draft-session.repository';
import type { GetDraftSessionByLobbyQuery } from '../queries/get-draft-session-by-lobby.query';

export class GetDraftSessionByLobbyUseCase {
  constructor(private readonly draftSessionRepository: DraftSessionRepository) {}

  async execute(query: GetDraftSessionByLobbyQuery): Promise<DraftSession | null> {
    return this.draftSessionRepository.findByLobbyId(query.lobbyId);
  }
}
