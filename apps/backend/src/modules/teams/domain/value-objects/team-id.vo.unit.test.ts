import { describe, expect, it } from 'vitest';

import { InvalidTeamIdError } from '../errors/team.errors';

import { TeamId } from './team-id.vo';

const VALID_TEAM_ID = '550e8400-e29b-41d4-a716-446655440010';

describe('TeamId', () => {
  it('creates a valid team id', () => {
    const id = TeamId.create(VALID_TEAM_ID);
    expect(id.value).toBe(VALID_TEAM_ID);
  });

  it('rejects invalid uuid', () => {
    expect(() => TeamId.create('not-a-uuid')).toThrow(InvalidTeamIdError);
  });
});
