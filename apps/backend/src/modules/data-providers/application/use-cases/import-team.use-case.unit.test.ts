import { describe, expect, it, vi } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import {
  createMockLeagueRepository,
  createMockTeamRepository,
} from '../../../../testing/repository-mocks';
import type { NationRepository } from '../../../nations/domain/repositories/nation.repository';
import { ExternalTeamNotFoundError } from '../../domain/errors/data-provider.errors';
import type { ExternalTeamRecord } from '../../domain/models/external-team-record';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';
import type { TeamProvider } from '../../domain/ports/team-provider.port';
import { mapExternalTeamToDomain } from '../mappers/external-team-to-team.mapper';

import { ImportTeamUseCase } from './import-team.use-case';

const record: ExternalTeamRecord = {
  provider: ExternalProvider.SPORTDB,
  slug: 'barcelona',
  externalId: 'team-1',
  name: 'FC Barcelona',
  shortName: 'BAR',
  countryExternalId: null,
  leagueExternalId: null,
  country: 'ES',
  logoUrl: null,
};

const importCommand = {
  provider: 'SPORTDB',
  slug: 'barcelona',
  externalId: 'team-1',
};

function buildUseCase(teamProvider: TeamProvider) {
  const providerRegistry = {
    getTeamProvider: vi.fn().mockReturnValue(teamProvider),
  } as unknown as ProviderRegistryPort;

  const teamRepository = createMockTeamRepository({
    findByExternalReference: vi.fn().mockResolvedValue(null),
  });
  const leagueRepository = createMockLeagueRepository();
  const nationRepository: NationRepository = {
    findById: vi.fn(),
    findByExternalReference: vi.fn(),
    findAll: vi.fn(),
    save: vi.fn(),
  };

  const useCase = new ImportTeamUseCase(
    providerRegistry,
    teamRepository,
    leagueRepository,
    nationRepository,
  );

  return { useCase, teamRepository };
}

describe('ImportTeamUseCase', () => {
  it('imports team when provider returns data', async () => {
    const teamProvider: TeamProvider = {
      searchTeams: vi.fn(),
      fetchBySlugAndId: vi.fn().mockResolvedValue(record),
    };
    const { useCase } = buildUseCase(teamProvider);
    const team = await useCase.execute(importCommand);

    expect(team.name.value).toBe('FC Barcelona');
  });

  it('updates existing team on re-import', async () => {
    const existing = mapExternalTeamToDomain(record, { countryId: null, leagueId: null });
    const updatedRecord: ExternalTeamRecord = { ...record, name: 'Barcelona CF' };

    const teamProvider: TeamProvider = {
      searchTeams: vi.fn(),
      fetchBySlugAndId: vi.fn().mockResolvedValue(updatedRecord),
    };
    const { useCase, teamRepository } = buildUseCase(teamProvider);
    vi.mocked(teamRepository.findByExternalReference).mockResolvedValue(existing);

    const team = await useCase.execute(importCommand);

    expect(team.id.value).toBe(existing.id.value);
    expect(team.name.value).toBe('Barcelona CF');
  });

  it('throws when team not found at provider', async () => {
    const teamProvider: TeamProvider = {
      searchTeams: vi.fn(),
      fetchBySlugAndId: vi.fn().mockResolvedValue(null),
    };
    const { useCase } = buildUseCase(teamProvider);

    await expect(
      useCase.execute({ provider: 'SPORTDB', slug: 'missing', externalId: 'missing' }),
    ).rejects.toThrow(ExternalTeamNotFoundError);
  });
});
