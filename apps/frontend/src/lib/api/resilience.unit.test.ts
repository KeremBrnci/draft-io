import { describe, expect, it } from 'vitest';

import { ApiClientError } from './client';
import {
  isTransientApiError,
  normalizeApiErrorMessage,
} from './resilience';

describe('api resilience', () => {
  it('detects transient API failures', () => {
    expect(isTransientApiError(new ApiClientError('x', 502))).toBe(true);
    expect(isTransientApiError(new ApiClientError('x', 404))).toBe(false);
  });

  it('normalizes proxy error messages for users', () => {
    expect(
      normalizeApiErrorMessage(
        new ApiClientError('Backend request failed: fetch failed', 502),
        'fallback',
      ),
    ).toBe('Sunucuya geçici olarak ulaşılamadı.');
  });
});
