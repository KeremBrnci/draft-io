import { Position } from '../../../positions/domain/value-objects/position.vo';
import type { Player } from '../../domain/entities/player.entity';
import { PlayerNotFoundError } from '../../domain/errors/player.errors';
import type { PlayerRepository } from '../../domain/repositories/player.repository';
import { PlayerId } from '../../domain/value-objects/player-id.vo';
import type { UpdatePlayerCommand } from '../commands/update-player.command';

export class UpdatePlayerUseCase {
  constructor(private readonly playerRepository: PlayerRepository) {}

  async execute(command: UpdatePlayerCommand): Promise<Player> {
    const playerId = PlayerId.create(command.playerId);
    const player = await this.playerRepository.findById(playerId);

    if (player === null) {
      throw new PlayerNotFoundError(command.playerId);
    }

    if (command.position !== undefined) {
      player.updatePrimaryPosition(Position.create(command.position));
    }

    await this.playerRepository.save(player);

    return player;
  }
}
