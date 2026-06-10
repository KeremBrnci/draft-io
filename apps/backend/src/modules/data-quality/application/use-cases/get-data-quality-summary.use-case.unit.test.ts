import { describe, expect, it, vi } from 'vitest';

import type { DataQualityRepository } from '../../domain/repositories/data-quality.repository';
import { GetDataQualitySummaryUseCase } from './get-data-quality-summary.use-case';

describe('GetDataQualitySummaryUseCase', () => {
  it('returns summary metrics from repository', async () => {
    const summary = {
      totalPlayers: 4000,
      totalClubs: 180,
      totalCompetitions: 8,
      playersWithMarketValue: 3200,
      playersWithoutMarketValue: 800,
      playersWithImage: 2500,
      playersWithoutImage: 1500,
      playersWithPosition: 3900,
      playersWithoutPosition: 100,
      playersWithAge: 3950,
      playersWithoutAge: 50,
      playersByCompetition: [{ label: 'Premier League', count: 500 }],
      playersByPosition: [{ label: 'ST', count: 400 }],
      playersByNationality: [{ label: 'England', count: 300 }],
      marketValueDistribution: [{ bucket: '1M-5M', count: 200 }],
      ageDistribution: [{ bucket: '20-24', count: 900 }],
    };

    const repository: DataQualityRepository = {
      getSummary: vi.fn().mockResolvedValue(summary),
      findIssues: vi.fn(),
    };

    const useCase = new GetDataQualitySummaryUseCase(repository);
    const result = await useCase.execute();

    expect(result.totalPlayers).toBe(4000);
    expect(result.playersByCompetition[0]?.label).toBe('Premier League');
    expect(repository.getSummary).toHaveBeenCalledOnce();
  });
});
