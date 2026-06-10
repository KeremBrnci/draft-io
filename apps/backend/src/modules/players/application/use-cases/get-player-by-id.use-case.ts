import type { Player } from '../../domain/entities/player.entity';
import { PlayerNotFoundError } from '../../domain/errors/player.errors';
import type { PlayerRepository } from '../../domain/repositories/player.repository';
import { PlayerId } from '../../domain/value-objects/player-id.vo';
import type { GetPlayerByIdQuery } from '../queries/get-player-by-id.query';

export class GetPlayerByIdUseCase {
  constructor(private readonly playerRepository: PlayerRepository) {}

  async execute(query: GetPlayerByIdQuery): Promise<Player> {
    const playerId = PlayerId.create(query.playerId);
    const player = await this.playerRepository.findById(playerId);

    if (player === null) {
      throw new PlayerNotFoundError(query.playerId);
    }

    return player;
  }
}
