import { Injectable } from '@nestjs/common';

import type { RoomEventsPublisher } from '../../application/services/room-events.publisher';
import type { RoomEventName, RoomEventPayload } from '../../domain/events/room.events';
import { RoomGateway } from '../../presentation/gateways/room.gateway';

@Injectable()
export class SocketRoomEventsPublisher implements RoomEventsPublisher {
  constructor(private readonly roomGateway: RoomGateway) {}

  async publish(lobbyCode: string, event: RoomEventName, payload: RoomEventPayload): Promise<void> {
    this.roomGateway.emitRoomEvent(lobbyCode, event, payload);
  }
}
