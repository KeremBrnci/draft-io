import { describe, expect, it, vi } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { createMockLeagueRepository } from '../../../../testing/repository-mocks';
import type { NationRepository } from '../../../nations/domain/repositories/nation.repository';
import type { LeagueProvider } from '../../domain/ports/league-provider.port';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';
import { mapExternalLeagueToDomain } from '../mappers/external-league-to-league.mapper';

import { ImportLeagueUseCase } from './import-league.use-case';

const importCommand = {
  provider: 'SPORTDB',
  slug: 'bundesliga',
  externalId: 'bundesliga-de',
  name: 'Bundesliga',
  country: 'Germany',
};

function buildUseCase(leagueProvider: LeagueProvider) {
  const providerRegistry = {
    getLeagueProvider: vi.fn().mockReturnValue(leagueProvider),
  } as unknown as ProviderRegistryPort;

  const leagueRepository = createMockLeagueRepository({
    findByExternalReference: vi.fn().mockResolvedValue(null),
  });
  const nationRepository: NationRepository = {
    findById: vi.fn(),
    findByExternalReference: vi.fn(),
    findAll: vi.fn(),
    save: vi.fn(),
  };

  return {
    useCase: new ImportLeagueUseCase(providerRegistry, leagueRepository, nationRepository),
    leagueRepository,
  };
}

describe('ImportLeagueUseCase', () => {
  it('imports league from search selection', async () => {
    const leagueProvider: LeagueProvider = {
      searchLeagues: vi.fn(),
      buildRecordFromSearchResult: vi.fn().mockReturnValue({
        provider: ExternalProvider.SPORTDB,
        slug: 'bundesliga',
        externalId: 'bundesliga-de',
        name: 'Bundesliga',
        countryExternalId: null,
        country: 'Germany',
        logoUrl: null,
      }),
    };
    const { useCase } = buildUseCase(leagueProvider);
    const league = await useCase.execute(importCommand);

    expect(league.name.value).toBe('Bundesliga');
  });

  it('updates existing league on re-import', async () => {
    const record = {
      provider: ExternalProvider.SPORTDB,
      slug: 'bundesliga',
      externalId: 'bundesliga-de',
      name: 'Bundesliga Updated',
      countryExternalId: null,
      country: 'Germany',
      logoUrl: null,
    };
    const existing = mapExternalLeagueToDomain(
      { ...record, name: 'Bundesliga' },
      { countryId: null },
    );

    const leagueProvider: LeagueProvider = {
      searchLeagues: vi.fn(),
      buildRecordFromSearchResult: vi.fn().mockReturnValue(record),
    };
    const { useCase, leagueRepository } = buildUseCase(leagueProvider);
    vi.mocked(leagueRepository.findByExternalReference).mockResolvedValue(existing);

    const league = await useCase.execute(importCommand);

    expect(league.id.value).toBe(existing.id.value);
    expect(league.name.value).toBe('Bundesliga Updated');
  });
});
