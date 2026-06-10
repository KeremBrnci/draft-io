import { describe, expect, it } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { TeamExternalReference } from '../value-objects/external-reference.vo';
import { TeamId } from '../value-objects/team-id.vo';
import { TeamName } from '../value-objects/team-name.vo';
import { TeamShortName } from '../value-objects/team-short-name.vo';

import { Team } from './team.entity';

const VALID_TEAM_ID = '550e8400-e29b-41d4-a716-446655440010';

describe('Team', () => {
  it('creates an imported club team', () => {
    const team = Team.create({
      id: TeamId.create(VALID_TEAM_ID),
      externalReference: TeamExternalReference.create(ExternalProvider.SPORTDB, 'team-1'),
      name: TeamName.create('FC Barcelona'),
      shortName: TeamShortName.create('BAR'),
      countryId: null,
      leagueId: null,
      country: 'ES',
      logoUrl: 'https://example.com/barca.png',
    });

    expect(team.externalReference?.externalId).toBe('team-1');
    expect(team.shortName?.value).toBe('BAR');
    expect(team.formationCode).toBeNull();
    expect(team.startingEleven).toBeNull();
  });

  it('updates formation and manager for game squads', () => {
    const team = Team.reconstitute({
      id: TeamId.create(VALID_TEAM_ID),
      externalReference: null,
      name: TeamName.create('Game Team'),
      shortName: null,
      countryId: null,
      leagueId: null,
      country: null,
      logoUrl: null,
      formationCode: '4-4-2',
      manager: 'Coach',
      startingEleven: null,
      chemistryScore: null,
      teamOverall: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    team.assignFormation('4-3-3');
    team.assignManager('New Coach');

    expect(team.formationCode).toBe('4-3-3');
    expect(team.manager).toBe('New Coach');
  });
});
