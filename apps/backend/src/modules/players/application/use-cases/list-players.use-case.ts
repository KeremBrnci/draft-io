import type { Player } from '../../domain/entities/player.entity';
import type { PlayerRepository } from '../../domain/repositories/player.repository';
import type { ListPlayersQuery } from '../queries/list-players.query';

export class ListPlayersUseCase {
  constructor(private readonly playerRepository: PlayerRepository) {}

  async execute(query: ListPlayersQuery = {}): Promise<readonly Player[]> {
    const players = await this.playerRepository.findAll();

    if (query.position === undefined) {
      return players;
    }

    return players.filter((player) => player.primaryPosition.value === query.position);
  }
}
