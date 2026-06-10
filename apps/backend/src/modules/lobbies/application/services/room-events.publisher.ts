import type { RoomEventName, RoomEventPayload } from '../../domain/events/room.events';

export interface RoomEventsPublisher {
  publish(lobbyCode: string, event: RoomEventName, payload: RoomEventPayload): Promise<void>;
}

export const ROOM_EVENTS_PUBLISHER = Symbol('ROOM_EVENTS_PUBLISHER');
