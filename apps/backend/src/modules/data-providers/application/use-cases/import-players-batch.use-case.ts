import type { Player } from '../../../players/domain/entities/player.entity';
import type { ImportPlayersBatchCommand } from '../commands/import-players-batch.command';

import { type ImportPlayerUseCase } from './import-player.use-case';

export class ImportPlayersBatchUseCase {
  constructor(private readonly importPlayerUseCase: ImportPlayerUseCase) {}

  async execute(command: ImportPlayersBatchCommand): Promise<readonly Player[]> {
    const players: Player[] = [];

    for (const item of command.items) {
      const player = await this.importPlayerUseCase.execute(item);
      players.push(player);
    }

    return players;
  }
}
