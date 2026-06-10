import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import type { PlayerRepository } from '../../../players/domain/repositories/player.repository';
import type { TeamRepository } from '../../../teams/domain/repositories/team.repository';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';

export interface AdminDashboardMetrics {
  readonly totalPlayers: number;
  readonly totalClubs: number;
  readonly totalCompetitions: number;
  readonly importedToday: number;
  readonly failedImports: number;
}

export class GetAdminDashboardMetricsUseCase {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly teamRepository: TeamRepository,
    private readonly leagueRepository: LeagueRepository,
    private readonly importJobRepository: ImportJobRepository,
  ) {}

  async execute(): Promise<AdminDashboardMetrics> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalPlayers, totalClubs, totalCompetitions, importedToday, failedImports] =
      await Promise.all([
        this.playerRepository.count(),
        this.teamRepository.count(),
        this.leagueRepository.count(),
        this.playerRepository.countCreatedSince(startOfToday),
        this.importJobRepository.countFailed(),
      ]);

    return {
      totalPlayers,
      totalClubs,
      totalCompetitions,
      importedToday,
      failedImports,
    };
  }
}
