import { describe, expect, it, vi } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { Team } from '../../../teams/domain/entities/team.entity';
import { TeamExternalReference } from '../../../teams/domain/value-objects/external-reference.vo';
import { TeamId } from '../../../teams/domain/value-objects/team-id.vo';
import { TeamName } from '../../../teams/domain/value-objects/team-name.vo';

import type { ImportTeamUseCase } from './import-team.use-case';
import { ImportTeamsBatchUseCase } from './import-teams-batch.use-case';

describe('ImportTeamsBatchUseCase', () => {
  it('imports each team item', async () => {
    const team = Team.create({
      id: TeamId.create('550e8400-e29b-41d4-a716-446655440010'),
      externalReference: TeamExternalReference.create(ExternalProvider.SPORTDB, 't1'),
      name: TeamName.create('Team'),
      shortName: null,
      countryId: null,
      leagueId: null,
      country: null,
      logoUrl: null,
    });
    const importTeamUseCase = {
      execute: vi.fn().mockResolvedValue(team),
    } as unknown as ImportTeamUseCase;

    const useCase = new ImportTeamsBatchUseCase(importTeamUseCase);
    const result = await useCase.execute({
      items: [{ provider: 'SPORTDB', slug: 'team', externalId: 't1' }],
    });

    expect(result).toHaveLength(1);
  });
});
