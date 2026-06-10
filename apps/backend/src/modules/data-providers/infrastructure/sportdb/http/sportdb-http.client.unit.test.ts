import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ProviderConfigurationError,
  ProviderRateLimitError,
  ProviderResponseError,
  ProviderTransportError,
} from '../../../domain/errors/data-provider.errors';
import { type SportDbConfigService } from '../config/sportdb.config';

import { SportDbHttpClient, type FetchFn } from './sportdb-http.client';

const FIXTURES = join(process.cwd(), 'test/fixtures/sportdb');

function loadFixture(name: string): unknown {
  return JSON.parse(readFileSync(join(FIXTURES, name), 'utf8')) as unknown;
}

function createConfigService(overrides: Record<string, unknown> = {}): SportDbConfigService {
  const values: Record<string, unknown> = {
    SPORTDB_API_KEY: 'test-key',
    SPORTDB_BASE_URL: 'https://api.sportdb.dev/api/flashscore',
    SPORTDB_RPS_LIMIT: 100,
    SPORTDB_TIMEOUT_MS: 5000,
    SPORTDB_RETRY_ATTEMPTS: 2,
    ...overrides,
  };

  return {
    getConfig: () => ({
      apiKey: values.SPORTDB_API_KEY as string | undefined,
      baseUrl: values.SPORTDB_BASE_URL as string,
      requestsPerSecond: values.SPORTDB_RPS_LIMIT as number,
      timeoutMs: values.SPORTDB_TIMEOUT_MS as number,
      retryAttempts: values.SPORTDB_RETRY_ATTEMPTS as number,
    }),
    isConfigured: () => Boolean(values.SPORTDB_API_KEY),
  } as SportDbConfigService;
}

describe('SportDbHttpClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throws ProviderConfigurationError when API key is missing', async () => {
    const client = new SportDbHttpClient(createConfigService({ SPORTDB_API_KEY: undefined }));

    await expect(client.getJson('search', { q: 'messi', type: 'player' })).rejects.toThrow(
      ProviderConfigurationError,
    );
  });

  it('sends X-API-Key header and parses JSON', async () => {
    const fetchFn = vi
      .fn<FetchFn>()
      .mockResolvedValue(
        new Response(JSON.stringify(loadFixture('player-search-messi.json')), { status: 200 }),
      );

    const client = new SportDbHttpClient(createConfigService()).withFetchFn(fetchFn);
    const result = await client.getJson<{ results: unknown[] }>('search', {
      q: 'messi',
      type: 'player',
    });

    expect(result.results).toHaveLength(1);
    expect(fetchFn).toHaveBeenCalledWith(
      'https://api.sportdb.dev/api/flashscore/search?q=messi&type=player',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-API-Key': 'test-key' }) as Record<string, string>,
      }),
    );
  });

  it('retries transient 500 responses', async () => {
    const fetchFn = vi
      .fn<FetchFn>()
      .mockResolvedValueOnce(new Response('error', { status: 500 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(loadFixture('player-detail-messi.json')), { status: 200 }),
      );

    const client = new SportDbHttpClient(createConfigService()).withFetchFn(fetchFn);
    const promise = client.getJson('player/messi-lionel/vgOOdZbd');

    await vi.runAllTimersAsync();
    const result = await promise;

    expect((result as { id: string }).id).toBe('vgOOdZbd');
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('maps 429 to ProviderRateLimitError without retrying past limit', async () => {
    const fetchFn = vi.fn<FetchFn>().mockResolvedValue(new Response('slow down', { status: 429 }));

    const client = new SportDbHttpClient(
      createConfigService({ SPORTDB_RETRY_ATTEMPTS: 0 }),
    ).withFetchFn(fetchFn);

    await expect(client.getJson('search')).rejects.toThrow(ProviderRateLimitError);
  });

  it('does not retry 404 responses', async () => {
    const fetchFn = vi.fn<FetchFn>().mockResolvedValue(new Response('missing', { status: 404 }));

    const client = new SportDbHttpClient(createConfigService()).withFetchFn(fetchFn);

    await expect(client.getJson('player/missing/id')).rejects.toThrow(ProviderResponseError);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('maps network failures to ProviderTransportError', async () => {
    const fetchFn = vi.fn<FetchFn>().mockRejectedValue(new Error('network down'));

    const client = new SportDbHttpClient(
      createConfigService({ SPORTDB_RETRY_ATTEMPTS: 0 }),
    ).withFetchFn(fetchFn);

    await expect(client.getJson('search')).rejects.toThrow(ProviderTransportError);
  });
});
