import type { RoomChatMessageDto, SendRoomChatMessageCommandDto } from '@draft-io/shared-types';

import { apiGet, apiPost } from './client';

export function getRoomChatMessages(
  code: string,
  sessionToken: string,
): Promise<readonly RoomChatMessageDto[]> {
  const params = new URLSearchParams({ sessionToken });
  return apiGet<readonly RoomChatMessageDto[]>(
    `/lobbies/code/${encodeURIComponent(code.toUpperCase())}/chat?${params.toString()}`,
  );
}

export function sendRoomChatMessage(
  code: string,
  body: SendRoomChatMessageCommandDto,
): Promise<RoomChatMessageDto> {
  return apiPost<RoomChatMessageDto>(
    `/lobbies/code/${encodeURIComponent(code.toUpperCase())}/chat`,
    body,
  );
}
