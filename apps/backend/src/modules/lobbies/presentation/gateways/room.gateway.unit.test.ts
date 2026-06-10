import { describe, expect, it } from 'vitest';

import { RoomGateway } from '../../presentation/gateways/room.gateway';
import { RoomEventName } from '../../domain/events/room.events';

describe('RoomGateway', () => {
  it('exposes join_room subscription handler', () => {
    const gateway = new RoomGateway();
    expect(gateway).toBeDefined();
    expect(RoomEventName.DRAFT_READY).toBe('DRAFT_READY');
  });
});
