import { describe, expect, it } from 'vitest';

import { InvalidStartingElevenError } from '../errors/team.errors';

import { StartingEleven } from './starting-eleven.vo';

describe('StartingEleven', () => {
  it('creates an empty lineup with 11 null slots', () => {
    const lineup = StartingEleven.createEmpty();

    expect(lineup.playerIds).toHaveLength(11);
    expect(lineup.assignedCount).toBe(0);
  });

  it('rejects lineups with wrong slot count', () => {
    expect(() => StartingEleven.create(['player-1'])).toThrow(InvalidStartingElevenError);
  });
});
