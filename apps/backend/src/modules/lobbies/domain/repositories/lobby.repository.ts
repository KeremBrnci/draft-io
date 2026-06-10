import type { Lobby } from '../entities/lobby.entity';
import type { LobbyCode } from '../value-objects/lobby-code.vo';
import type { LobbyId } from '../value-objects/lobby-id.vo';

export const LOBBY_REPOSITORY = Symbol('LobbyRepository');

export interface LobbyRepository {
  findById(id: LobbyId): Promise<Lobby | null>;
  findByCode(code: LobbyCode): Promise<Lobby | null>;
  existsByCode(code: LobbyCode): Promise<boolean>;
  save(lobby: Lobby): Promise<void>;
  delete(id: LobbyId): Promise<void>;
}
