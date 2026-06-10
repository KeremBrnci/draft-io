import { describe, expect, it } from 'vitest';

import { PlayerPosition as PrismaPlayerPosition } from '@prisma/client';

import { PlayerId } from '../../domain/value-objects/player-id.vo';
import { toPlayerPositionsDomain } from './player-position.mapper';

const PLAYER_ID = PlayerId.create('550e8400-e29b-41d4-a716-446655440000');

describe('player-position.mapper', () => {
  it('reconstitutes persisted rows into a validated PlayerPositions set', () => {
    const rows: PrismaPlayerPosition[] = [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        playerId: PLAYER_ID.value,
        positionCode: 'CDM',
        isPrimary: true,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440002',
        playerId: PLAYER_ID.value,
        positionCode: 'CM',
        isPrimary: false,
        createdAt: new Date('2024-01-02'),
      },
    ];

    const positions = toPlayerPositionsDomain(PLAYER_ID, rows);

    expect(positions.primaryCode).toBe('CDM');
    expect(positions.secondaryCodes).toEqual(['CM']);
  });
});
