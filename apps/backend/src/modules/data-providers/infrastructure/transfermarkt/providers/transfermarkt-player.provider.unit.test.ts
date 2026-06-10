import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type TransfermarktConfigService } from '../config/transfermarkt.config';
import type { TransfermarktClubPlayersDto } from '../dtos/transfermarkt.dto';
import { type TransfermarktHttpClient } from '../http/transfermarkt-http.client';

import { TransfermarktPlayerProvider } from './transfermarkt-player.provider';

function createConfigService(seasonId?: string): TransfermarktConfigService {
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

describe('TransfermarktPlayerProvider', () => {
  const clubPlayersResponse: TransfermarktClubPlayersDto = {
    id: '11',
    players: [
      {
        id: '1',
        name: 'Test Player',
        position: 'Centre-Forward',
      },
    ],
  };

  let httpClient: TransfermarktHttpClient;
  let getJson: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getJson = vi.fn().mockResolvedValue(clubPlayersResponse);
    httpClient = {
      getJson,
    } as unknown as TransfermarktHttpClient;
  });

  it('requests club players with computed season_id when not configured', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-09T12:00:00Z'));

    const provider = new TransfermarktPlayerProvider(httpClient, createConfigService());
    await provider.fetchClubPlayers('11', 'GB1');

    expect(getJson).toHaveBeenCalledWith('clubs/11/players?season_id=2025');

    vi.useRealTimers();
  });

  it('requests club players with configured season_id override', async () => {
    const provider = new TransfermarktPlayerProvider(httpClient, createConfigService('2024'));
    await provider.fetchClubPlayers('1237', null);

    expect(getJson).toHaveBeenCalledWith('clubs/1237/players?season_id=2024');
  });
});
