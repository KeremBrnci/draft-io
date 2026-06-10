import type { LobbyParticipant } from '../../domain/entities/lobby-participant.entity';
import type { Lobby } from '../../domain/entities/lobby.entity';

export interface LobbySession {
  readonly lobby: Lobby;
  readonly participant: LobbyParticipant;
}
