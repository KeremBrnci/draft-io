import { describe, expect, it } from 'vitest';

import { InvalidPlayerIdError } from '../errors/player.errors';

import { PlayerId } from './player-id.vo';

const VALID_PLAYER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('PlayerId', () => {
  it('accepts valid UUIDs', () => {
    expect(PlayerId.create(VALID_PLAYER_ID).value).toBe(VALID_PLAYER_ID);
  });

  it('rejects invalid UUIDs', () => {
    expect(() => PlayerId.create('not-a-uuid')).toThrow(InvalidPlayerIdError);
    expect(() => PlayerId.create('')).toThrow(InvalidPlayerIdError);
  });

  it('stringifies to the raw id value', () => {
    expect(PlayerId.create(VALID_PLAYER_ID).toString()).toBe(VALID_PLAYER_ID);
  });
});
