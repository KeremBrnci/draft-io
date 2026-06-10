import type { League } from '../../domain/entities/league.entity';
import type { LeagueRepository } from '../../domain/repositories/league.repository';

export class ListLeaguesUseCase {
  constructor(private readonly leagueRepository: LeagueRepository) {}

  async execute(): Promise<readonly League[]> {
    return this.leagueRepository.findAll();
  }
}
