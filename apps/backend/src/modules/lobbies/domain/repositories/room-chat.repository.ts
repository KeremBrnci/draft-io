export interface RoomChatMessageRecord {
  readonly id: string;
  readonly lobbyId: string;
  readonly participantId: string;
  readonly displayName: string;
  readonly body: string;
  readonly createdAt: Date;
}

export interface CreateRoomChatMessageInput {
  readonly lobbyId: string;
  readonly participantId: string;
  readonly displayName: string;
  readonly body: string;
}

export interface RoomChatRepository {
  listByLobbyId(lobbyId: string, limit?: number): Promise<readonly RoomChatMessageRecord[]>;
  create(input: CreateRoomChatMessageInput): Promise<RoomChatMessageRecord>;
  deleteByLobbyId(lobbyId: string): Promise<void>;
}

export const ROOM_CHAT_REPOSITORY = Symbol('ROOM_CHAT_REPOSITORY');
