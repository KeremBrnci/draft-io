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

    const result = await apiGet('/players/1');
    expect(result).toEqual(mockData);
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
});
