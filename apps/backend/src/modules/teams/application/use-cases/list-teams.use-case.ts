import type { Team } from '../../domain/entities/team.entity';
import type { TeamRepository } from '../../domain/repositories/team.repository';

export interface ListTeamsQuery {
  readonly leagueId?: string;
}

export class ListTeamsUseCase {
  constructor(private readonly teamRepository: TeamRepository) {}

  async execute(query: ListTeamsQuery = {}): Promise<readonly Team[]> {
    if (query.leagueId !== undefined) {
      return this.teamRepository.findByLeagueId(query.leagueId);
    }

    return this.teamRepository.findAll();
  }
}
