import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import { TARGET_COMPETITIONS } from '../../domain/catalog/target-competitions.catalog';
import type { ImportJob } from '../../domain/entities/import-job.entity';
import { ImportJobStatus } from '../../domain/enums/import-job-status';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';

export type TargetCompetitionImportStatus = 'NOT_IMPORTED' | 'RUNNING' | 'IMPORTED';

export interface TargetCompetitionView {
  readonly externalId: string;
  readonly slug: string;
  readonly name: string;
  readonly countryName: string;
  readonly countryExternalId: string;
  readonly tier: 1 | 2;
  readonly imported: boolean;
  readonly importStatus: TargetCompetitionImportStatus;
}

export class ListTargetCompetitionsUseCase {
  constructor(
    private readonly leagueRepository: LeagueRepository,
    private readonly importJobRepository: ImportJobRepository,
  ) {}

  async execute(): Promise<readonly TargetCompetitionView[]> {
    const [leagues, recentJobs] = await Promise.all([
      this.leagueRepository.findAll(),
      this.importJobRepository.findRecent(200),
    ]);

    const importedLeagueIds = new Set(
      leagues
        .filter((league) => league.externalReference?.provider === ExternalProvider.TRANSFERMARKT)
        .map((league) => league.externalReference?.externalId)
        .filter((externalId): externalId is string => externalId !== undefined),
    );

    const runningCompetitionIds = collectRunningCompetitionIds(recentJobs);

    return TARGET_COMPETITIONS.map((competition) => {
      const imported = importedLeagueIds.has(competition.externalId);
      const importStatus = resolveImportStatus(
        competition.externalId,
        imported,
        runningCompetitionIds,
      );

      return {
        externalId: competition.externalId,
        slug: competition.slug,
        name: competition.name,
        countryName: competition.countryName,
        countryExternalId: competition.countryExternalId,
        tier: competition.tier,
        imported,
        importStatus,
      };
    });
  }
}

function collectRunningCompetitionIds(jobs: readonly ImportJob[]): ReadonlySet<string> {
  const runningStatuses = new Set<string>([ImportJobStatus.PENDING, ImportJobStatus.RUNNING]);

  return new Set(
    jobs
      .filter((job) => job.targetExternalId !== null && runningStatuses.has(job.status))
      .map((job) => job.targetExternalId!),
  );
}

function resolveImportStatus(
  externalId: string,
  imported: boolean,
  runningCompetitionIds: ReadonlySet<string>,
): TargetCompetitionImportStatus {
  if (runningCompetitionIds.has(externalId)) {
    return 'RUNNING';
  }

  if (imported) {
    return 'IMPORTED';
  }

  return 'NOT_IMPORTED';
}
