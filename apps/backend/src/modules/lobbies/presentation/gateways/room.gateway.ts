import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

import type { RoomEventName, RoomEventPayload } from '../../domain/events/room.events';

@WebSocketGateway({
  namespace: '/rooms',
  cors: {
    origin: true,
  },
})
@Injectable()
export class RoomGateway {
  @WebSocketServer()
  private server!: Server;

  emitRoomEvent(lobbyCode: string, event: RoomEventName, payload: RoomEventPayload): void {
    this.server.to(normalizeRoomCode(lobbyCode)).emit(event, payload);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { readonly code?: string },
  ): void {
    const code = normalizeRoomCode(body.code ?? '');
    if (code.length === 0) {
      return;
    }

    void client.join(code);
    client.emit('joined_room', { code });
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { readonly code?: string },
  ): void {
    const code = normalizeRoomCode(body.code ?? '');
    if (code.length === 0) {
      return;
    }

    void client.leave(code);
  }
}

function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase();
}
