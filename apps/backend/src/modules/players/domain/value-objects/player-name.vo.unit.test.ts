import { describe, expect, it } from 'vitest';

import { InvalidPlayerNameError } from '../errors/player.errors';

import { PlayerName } from './player-name.vo';

describe('PlayerName', () => {
  it('trims and stores valid names', () => {
    expect(PlayerName.create('  Lionel Messi  ').value).toBe('Lionel Messi');
  });

  it('rejects empty names', () => {
    expect(() => PlayerName.create('   ')).toThrow(InvalidPlayerNameError);
  });

  it('rejects names longer than 100 characters', () => {
    expect(() => PlayerName.create('a'.repeat(101))).toThrow(InvalidPlayerNameError);
  });
});
