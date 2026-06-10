import { describe, expect, it } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { Position } from '../../../positions/domain/value-objects/position.vo';
import { buildTestPlayerPositions } from '../../testing/player-test.factory';
import { PlayerStatus } from '../enums/player-status.enum';
import { InvalidPersonNameError } from '../errors/player.errors';
import { BirthDate } from '../value-objects/birth-date.vo';
import { DisplayName } from '../value-objects/display-name.vo';
import { ExternalReference } from '../value-objects/external-reference.vo';
import { Nationality } from '../value-objects/nationality.vo';
import { PersonName } from '../value-objects/person-name.vo';
import { PlayerId } from '../value-objects/player-id.vo';

import { Player } from './player.entity';

const VALID_PLAYER_ID = PlayerId.create('550e8400-e29b-41d4-a716-446655440000');

describe('Player', () => {
  it('creates an identity record without gameplay strength', () => {
    const player = Player.create({
      id: VALID_PLAYER_ID,
      externalReference: ExternalReference.create(ExternalProvider.SPORTDB, 'vgOOdZbd'),
      firstName: PersonName.create('Lionel'),
      lastName: PersonName.create('Messi'),
      displayName: DisplayName.create('Lionel Messi'),
      birthDate: BirthDate.create(new Date('1987-06-24')),
      nationality: Nationality.create('ar'),
      countryId: null,
      teamId: null,
      leagueId: null,
      positions: buildTestPlayerPositions(VALID_PLAYER_ID, 'RW', ['ST']),
      marketValue: null,
      marketValueCurrency: null,
      imageUrl: null,
      status: PlayerStatus.ACTIVE,
    });

    expect(player.externalReference?.externalId).toBe('vgOOdZbd');
    expect(player.displayName.value).toBe('Lionel Messi');
    expect(player.positions.secondaryCodes).toEqual(['ST']);
    expect('overall' in player).toBe(false);
  });

  it('rejects invalid person names', () => {
    expect(() => PersonName.create('   ')).toThrow(InvalidPersonNameError);
  });

  it('assigns team and league affiliation references', () => {
    const player = Player.create({
      id: VALID_PLAYER_ID,
      externalReference: null,
      firstName: PersonName.create('Test'),
      lastName: PersonName.create('Player'),
      displayName: DisplayName.create('Test Player'),
      birthDate: null,
      nationality: Nationality.create('US'),
      countryId: null,
      teamId: null,
      leagueId: null,
      positions: buildTestPlayerPositions(VALID_PLAYER_ID, 'CM'),
      marketValue: null,
      marketValueCurrency: null,
      imageUrl: null,
      status: PlayerStatus.ACTIVE,
    });

    player.assignTeam('team-uuid');
    player.assignLeague('league-uuid');
    player.updatePrimaryPosition(Position.create('CAM'));

    expect(player.teamId).toBe('team-uuid');
    expect(player.leagueId).toBe('league-uuid');
    expect(player.primaryPosition.value).toBe('CAM');
  });

  it('exposes deprecated aliases for transitional API mapping', () => {
    const player = Player.create({
      id: VALID_PLAYER_ID,
      externalReference: null,
      firstName: PersonName.create('Test'),
      lastName: PersonName.create('Player'),
      displayName: DisplayName.create('Alias Test'),
      birthDate: null,
      nationality: Nationality.create('US'),
      countryId: null,
      teamId: null,
      leagueId: null,
      positions: buildTestPlayerPositions(VALID_PLAYER_ID, 'ST'),
      marketValue: null,
      marketValueCurrency: null,
      imageUrl: null,
      status: PlayerStatus.ACTIVE,
    });

    expect(player.name.value).toBe('Alias Test');
    expect(player.position.value).toBe('ST');
  });
});
