import { describe, expect, it } from 'vitest';

import { InvalidTeamNameError } from '../errors/team.errors';

import { TeamName } from './team-name.vo';

describe('TeamName', () => {
  it('trims and stores a valid name', () => {
    const name = TeamName.create('  Test FC  ');
    expect(name.value).toBe('Test FC');
  });

  it('rejects empty names', () => {
    expect(() => TeamName.create('   ')).toThrow(InvalidTeamNameError);
  });
});
