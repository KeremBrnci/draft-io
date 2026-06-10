import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ProviderConfigurationError,
  ProviderResponseError,
} from '../../../domain/errors/data-provider.errors';
import { type TransfermarktConfigService } from '../config/transfermarkt.config';

import { TransfermarktHttpClient, type FetchFn } from './transfermarkt-http.client';

function createConfigService(overrides: Record<string, unknown> = {}): TransfermarktConfigService {
  const values: Record<string, unknown> = {
    TRANSFERMARKT_API_KEY: undefined,
    TRANSFERMARKT_BASE_URL: 'https://transfermarkt-api.fly.dev',
    TRANSFERMARKT_RPS_LIMIT: 100,
    TRANSFERMARKT_TIMEOUT_MS: 5000,
    TRANSFERMARKT_RETRY_ATTEMPTS: 1,
    ...overrides,
  };

  return {
    getConfig: () => ({
      apiKey: values.TRANSFERMARKT_API_KEY as string | undefined,
      baseUrl: values.TRANSFERMARKT_BASE_URL as string,
      seasonId: values.TRANSFERMARKT_SEASON_ID as string | undefined,
      requestsPerSecond: values.TRANSFERMARKT_RPS_LIMIT as number,
      timeoutMs: values.TRANSFERMARKT_TIMEOUT_MS as number,
      retryAttempts: values.TRANSFERMARKT_RETRY_ATTEMPTS as number,
    }),
    isConfigured: () => Boolean(values.TRANSFERMARKT_BASE_URL),
  } as TransfermarktConfigService;
}

describe('TransfermarktHttpClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('works without API key', async () => {
    const fetchFn = vi
      .fn<FetchFn>()
      .mockResolvedValue(new Response(JSON.stringify({ results: [] }), { status: 200 }));
    const client = new TransfermarktHttpClient(createConfigService()).withFetchFn(fetchFn);

    const promise = client.getJson<{ results: readonly unknown[] }>('players/search/messi');
    await vi.runAllTimersAsync();
    await promise;

    const [, init] = fetchFn.mock.calls[0] ?? [];
    const headers = init?.headers as Record<string, string>;
    expect(headers['X-API-Key']).toBeUndefined();
  });

  it('sends X-API-Key when configured', async () => {
    const fetchFn = vi
      .fn<FetchFn>()
      .mockResolvedValue(new Response(JSON.stringify({ results: [] }), { status: 200 }));
    const client = new TransfermarktHttpClient(
      createConfigService({ TRANSFERMARKT_API_KEY: 'secret' }),
    ).withFetchFn(fetchFn);

    const promise = client.getJson('players/search/messi');
    await vi.runAllTimersAsync();
    await promise;

    const [, init] = fetchFn.mock.calls[0] ?? [];
    const headers = init?.headers as Record<string, string>;
    expect(headers['X-API-Key']).toBe('secret');
  });

  it('maps 401 to ProviderConfigurationError', async () => {
    const fetchFn = vi
      .fn<FetchFn>()
      .mockResolvedValue(new Response('unauthorized', { status: 401 }));
    const client = new TransfermarktHttpClient(createConfigService()).withFetchFn(fetchFn);

    await expect(client.getJson('players/search/messi')).rejects.toThrow(
      ProviderConfigurationError,
    );
  });

  it('maps 404 to ProviderResponseError', async () => {
    const fetchFn = vi.fn<FetchFn>().mockResolvedValue(new Response('not found', { status: 404 }));
    const client = new TransfermarktHttpClient(createConfigService()).withFetchFn(fetchFn);

    await expect(client.getJson('players/unknown/profile')).rejects.toThrow(ProviderResponseError);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
