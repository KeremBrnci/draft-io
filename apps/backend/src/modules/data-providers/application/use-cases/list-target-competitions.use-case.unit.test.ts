import { describe, expect, it, vi } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { League } from '../../../leagues/domain/entities/league.entity';
import { LeagueExternalReference } from '../../../leagues/domain/value-objects/external-reference.vo';
import { LeagueId } from '../../../leagues/domain/value-objects/league-id.vo';
import { LeagueName } from '../../../leagues/domain/value-objects/league-name.vo';
import type { LeagueRepository } from '../../../leagues/domain/repositories/league.repository';
import { ImportJob } from '../../domain/entities/import-job.entity';
import { ImportJobStatus } from '../../domain/enums/import-job-status';
import { ImportJobType } from '../../domain/enums/import-job-type';
import { ImportJobId } from '../../domain/value-objects/import-job-id.vo';
import type { ImportJobRepository } from '../../domain/repositories/import-job.repository';

import { ListTargetCompetitionsUseCase } from './list-target-competitions.use-case';

describe('ListTargetCompetitionsUseCase', () => {
  it('returns eight curated competitions with import status', async () => {
    const leagueRepository = {
      findAll: vi.fn().mockResolvedValue([
        League.reconstitute({
          id: LeagueId.create('00000000-0000-4000-8000-000000000001'),
          externalReference: LeagueExternalReference.create(ExternalProvider.TRANSFERMARKT, 'GB1'),
          name: LeagueName.create('Premier League'),
          slug: 'premier-league',
          countryId: null,
          country: 'England',
          logoUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ]),
    } satisfies Partial<LeagueRepository>;

    const importJobRepository = {
      findRecent: vi.fn().mockResolvedValue([
        ImportJob.reconstitute({
          id: ImportJobId.create('00000000-0000-4000-8000-000000000099'),
          jobType: ImportJobType.PIPELINE,
          provider: ExternalProvider.TRANSFERMARKT,
          targetExternalId: 'ES1',
          targetName: 'LaLiga',
          status: ImportJobStatus.RUNNING,
          startedAt: new Date(),
          finishedAt: null,
          totalRecords: 0,
          processedRecords: 0,
          failedRecords: 0,
          errorMessage: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ]),
    } satisfies Partial<ImportJobRepository>;

    const useCase = new ListTargetCompetitionsUseCase(
      leagueRepository as LeagueRepository,
      importJobRepository as ImportJobRepository,
    );

    const competitions = await useCase.execute();

    expect(competitions).toHaveLength(8);
    expect(competitions.find((c) => c.externalId === 'GB1')).toMatchObject({
      imported: true,
      importStatus: 'IMPORTED',
    });
    expect(competitions.find((c) => c.externalId === 'ES1')).toMatchObject({
      imported: false,
      importStatus: 'RUNNING',
    });
    expect(competitions.find((c) => c.externalId === 'TR1')).toMatchObject({
      imported: false,
      importStatus: 'NOT_IMPORTED',
    });
  });
});
