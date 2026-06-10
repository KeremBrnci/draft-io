import { describe, expect, it } from 'vitest';

import { InvalidPlayerAgeError } from '../errors/player.errors';
import { PlayerAge } from './player-age.vo';

describe('PlayerAge', () => {
  it('accepts valid age', () => {
    expect(PlayerAge.create(25).value).toBe(25);
  });

  it('rejects out of range', () => {
    expect(() => PlayerAge.create(14)).toThrow(InvalidPlayerAgeError);
  });
});
