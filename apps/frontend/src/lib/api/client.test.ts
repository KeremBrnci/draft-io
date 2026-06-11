import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiGet, ApiClientError } from './client';

describe('apiGet', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed JSON on success', async () => {
    const mockData = { data: { id: '1', displayName: 'Test' } };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      }),
    );

    const result = await apiGet<{ id: string; displayName: string }>('/players/1');
    expect(result).toEqual(mockData.data);
  });

  it('throws ApiClientError on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      }),
    );

    await expect(apiGet('/players/missing')).rejects.toThrow(ApiClientError);
  });

  it('retries transient upstream failures before surfacing an error', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: () => Promise.resolve({ message: 'Backend request failed: timeout' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { ok: true } }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const result = await apiGet<{ ok: boolean }>('/health');
    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
