import { Module } from '@nestjs/common';

import { ROOM_EVENTS_PUBLISHER } from './application/services/room-events.publisher';
import { SocketRoomEventsPublisher } from './infrastructure/events/socket-room-events.publisher';
import { RoomGateway } from './presentation/gateways/room.gateway';

@Module({
  providers: [
    RoomGateway,
    {
      provide: ROOM_EVENTS_PUBLISHER,
      useClass: SocketRoomEventsPublisher,
    },
  ],
  exports: [ROOM_EVENTS_PUBLISHER, RoomGateway],
})
export class RoomEventsModule {}
