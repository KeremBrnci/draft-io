export interface RoomChatMessageDto {
  readonly id: string;
  readonly lobbyCode: string;
  readonly participantId: string;
  readonly displayName: string;
  readonly body: string;
  readonly sentAt: string;
}

export interface SendRoomChatMessageCommandDto {
  readonly sessionToken: string;
  readonly body: string;
}

export interface ListRoomChatMessagesQueryDto {
  readonly sessionToken: string;
}
