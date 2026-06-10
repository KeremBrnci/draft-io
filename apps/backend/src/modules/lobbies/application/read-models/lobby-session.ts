import type { Lobby } from '../../domain/entities/lobby.entity';
import type { LobbyParticipant } from '../../domain/entities/lobby-participant.entity';

export interface LobbySession {
  readonly lobby: Lobby;
  readonly participant: LobbyParticipant;
}
