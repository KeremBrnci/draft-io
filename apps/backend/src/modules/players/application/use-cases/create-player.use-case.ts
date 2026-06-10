import { v4 as uuidv4 } from 'uuid';

import { Position } from '../../../positions/domain/value-objects/position.vo';
import { Player } from '../../domain/entities/player.entity';
import { PlayerStatus } from '../../domain/enums/player-status.enum';
import type { PlayerRepository } from '../../domain/repositories/player.repository';
import { DisplayName } from '../../domain/value-objects/display-name.vo';
import { Nationality } from '../../domain/value-objects/nationality.vo';
import { PersonName } from '../../domain/value-objects/person-name.vo';
import { PlayerId } from '../../domain/value-objects/player-id.vo';
import { PlayerPositionId } from '../../domain/value-objects/player-position-id.vo';
import { PlayerPositions } from '../../domain/value-objects/player-positions.vo';
import type { CreatePlayerCommand } from '../commands/create-player.command';

/** Creates player identity only. Cards are created separately (game-owned). */
export class CreatePlayerUseCase {
  constructor(private readonly playerRepository: PlayerRepository) {}

  async execute(command: CreatePlayerCommand): Promise<Player> {
    const displayName = DisplayName.create(command.name);
    const [first, ...rest] = command.name.trim().split(/\s+/);
    const firstName = PersonName.create(first ?? command.name);
    const lastName = PersonName.create(rest.join(' ') || firstName.value);
    const playerId = PlayerId.generate(uuidv4());

    const player = Player.create({
      id: playerId,
      externalReference: null,
      firstName,
      lastName,
      displayName,
      birthDate: null,
      nationality: Nationality.create(command.nationality ?? 'UNKNOWN'),
      countryId: null,
      teamId: null,
      leagueId: null,
      positions: PlayerPositions.withPrimary(
        playerId,
        () => PlayerPositionId.generate(uuidv4()),
        Position.create(command.position),
        [],
      ),
      marketValue: null,
      marketValueCurrency: null,
      imageUrl: null,
      status: PlayerStatus.ACTIVE,
    });

    await this.playerRepository.save(player);

    return player;
  }
}
