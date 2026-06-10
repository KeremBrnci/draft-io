import { v4 as uuidv4 } from 'uuid';

import { Position } from '../../positions/domain/value-objects/position.vo';
import { Player } from '../domain/entities/player.entity';
import type { CreatePlayerProps } from '../domain/entities/player.entity';
import { PlayerStatus } from '../domain/enums/player-status.enum';
import { DisplayName } from '../domain/value-objects/display-name.vo';
import { Nationality } from '../domain/value-objects/nationality.vo';
import { PersonName } from '../domain/value-objects/person-name.vo';
import { PlayerId } from '../domain/value-objects/player-id.vo';
import { PlayerPositionId } from '../domain/value-objects/player-position-id.vo';
import { PlayerPositions } from '../domain/value-objects/player-positions.vo';

const DEFAULT_ID = '550e8400-e29b-41d4-a716-446655440000';

export function buildTestPlayer(overrides: Partial<CreatePlayerProps> = {}): Player {
  const playerId = overrides.id ?? PlayerId.create(DEFAULT_ID);

  return Player.create({
    id: playerId,
    externalReference: null,
    firstName: PersonName.create('Test'),
    lastName: PersonName.create('Player'),
    displayName: DisplayName.create('Test Player'),
    birthDate: null,
    nationality: Nationality.create('US'),
    countryId: null,
    teamId: null,
    leagueId: null,
    positions:
      overrides.positions ??
      PlayerPositions.withPrimary(
        playerId,
        () => PlayerPositionId.generate(uuidv4()),
        Position.create('CM'),
        [],
      ),
    marketValue: null,
    marketValueCurrency: null,
    imageUrl: null,
    status: PlayerStatus.ACTIVE,
    ...overrides,
  });
}

export function buildTestPlayerPositions(
  playerId: PlayerId,
  primary: string,
  secondary: readonly string[] = [],
): PlayerPositions {
  return PlayerPositions.fromPrimaryAndSecondary(
    playerId,
    () => PlayerPositionId.generate(uuidv4()),
    primary,
    secondary,
  );
}
