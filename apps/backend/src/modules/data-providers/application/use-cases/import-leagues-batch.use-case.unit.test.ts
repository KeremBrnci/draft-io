import { describe, expect, it, vi } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { League } from '../../../leagues/domain/entities/league.entity';
import { LeagueExternalReference } from '../../../leagues/domain/value-objects/external-reference.vo';
import { LeagueId } from '../../../leagues/domain/value-objects/league-id.vo';
import { LeagueName } from '../../../leagues/domain/value-objects/league-name.vo';
import type { ImportLeagueUseCase } from './import-league.use-case';
import { ImportLeaguesBatchUseCase } from './import-leagues-batch.use-case';

describe('ImportLeaguesBatchUseCase', () => {
  it('imports each league item', async () => {
    const league = League.create({
      id: LeagueId.create('550e8400-e29b-41d4-a716-446655440020'),
      externalReference: LeagueExternalReference.create(ExternalProvider.SPORTDB, 'l1'),
      name: LeagueName.create('League'),
      slug: 'league',
      countryId: null,
      country: null,
      logoUrl: null,
    });
    const importLeagueUseCase = {
      execute: vi.fn().mockResolvedValue(league),
    } as unknown as ImportLeagueUseCase;

    const useCase = new ImportLeaguesBatchUseCase(importLeagueUseCase);
    const result = await useCase.execute({
      items: [
        {
          provider: 'SPORTDB',
          slug: 'league',
          externalId: 'l1',
          name: 'League',
        },
      ],
    });

    expect(result).toHaveLength(1);
  });
});
