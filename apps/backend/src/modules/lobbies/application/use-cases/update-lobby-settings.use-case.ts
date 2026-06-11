import { LobbyLifecycleService } from '../services/lobby-lifecycle.service';
import type { Lobby } from '../../domain/entities/lobby.entity';
import { InvalidLobbySessionError, NotLobbyHostError } from '../../domain/errors/lobby.errors';
import type { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { LobbyCode } from '../../domain/value-objects/lobby-code.vo';
import { SessionToken } from '../../domain/value-objects/session-token.vo';
import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import { LeagueId } from '../../../leagues/domain/value-objects/league-id.vo';

export class UpdateLobbySettingsUseCase {
  private readonly lifecycle: LobbyLifecycleService;

  constructor(
    private readonly lobbyRepository: LobbyRepository,
    private readonly leagueRepository: LeagueRepository,
  ) {
    this.lifecycle = new LobbyLifecycleService(lobbyRepository);
  }

  async execute(command: {
    readonly code: string;
    readonly sessionToken: string;
    readonly draftLeagueIds: readonly string[];
  }): Promise<Lobby> {
    const lobby = await this.lifecycle.requireActiveLobby(LobbyCode.create(command.code));
    const participant = lobby.findParticipantBySessionToken(
      SessionToken.reconstitute(command.sessionToken),
    );

    if (participant === null) {
      throw new InvalidLobbySessionError();
    }

    if (!participant.isHost) {
      throw new NotLobbyHostError();
    }

    const uniqueLeagueIds = [...new Set(command.draftLeagueIds)];
    if (uniqueLeagueIds.length > 0) {
      const leagues = await Promise.all(
        uniqueLeagueIds.map((id) => this.leagueRepository.findById(LeagueId.create(id))),
      );
      if (leagues.some((league) => league === null)) {
        throw new Error('One or more selected leagues were not found');
      }
    }

    lobby.updateDraftLeagueIds(SessionToken.reconstitute(command.sessionToken), uniqueLeagueIds);
    this.lifecycle.touch(lobby);
    await this.lobbyRepository.save(lobby);

    return lobby;
  }
}
