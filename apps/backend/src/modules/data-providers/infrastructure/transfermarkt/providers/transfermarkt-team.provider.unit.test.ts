import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProviderResponseError } from '../../../domain/errors/data-provider.errors';
import { TransfermarktConfigService } from '../config/transfermarkt.config';
import { TransfermarktHttpClient } from '../http/transfermarkt-http.client';
import { TransfermarktTeamProvider } from './transfermarkt-team.provider';

function createConfigService(seasonId: string | undefined = undefined): TransfermarktConfigService {
  return {
    getConfig: () => ({
      apiKey: undefined,
      baseUrl: 'https://transfermarkt-api.fly.dev',
      seasonId,
      requestsPerSecond: 2,
      timeoutMs: 10_000,
      retryAttempts: 0,
    }),
    isConfigured: () => true,
  } as TransfermarktConfigService;
}

describe('TransfermarktTeamProvider', () => {
  let getJson: ReturnType<typeof vi.fn>;
  let httpClient: TransfermarktHttpClient;

  beforeEach(() => {
    getJson = vi.fn().mockResolvedValue({ clubs: [] });
    httpClient = { getJson } as unknown as TransfermarktHttpClient;
  });

  it('requests competition clubs with computed season_id', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-09T12:00:00Z'));

    const provider = new TransfermarktTeamProvider(httpClient, createConfigService());
    await provider.listClubsByCompetition('GB1');

    expect(getJson).toHaveBeenCalledWith('competitions/GB1/clubs?season_id=2025');

    vi.useRealTimers();
  });

  it('falls back to previous season when current competition season is blocked', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-09T12:00:00Z'));

    getJson
      .mockRejectedValueOnce(new ProviderResponseError(405, 'blocked'))
      .mockResolvedValueOnce({
        clubs: [{ id: '11', name: 'Arsenal FC', country: 'England' }],
      });

    const provider = new TransfermarktTeamProvider(httpClient, createConfigService());
    const clubs = await provider.listClubsByCompetition('GB1');

    expect(getJson).toHaveBeenNthCalledWith(1, 'competitions/GB1/clubs?season_id=2025');
    expect(getJson).toHaveBeenNthCalledWith(2, 'competitions/GB1/clubs?season_id=2024');
    expect(clubs).toHaveLength(1);

    vi.useRealTimers();
  });
});
