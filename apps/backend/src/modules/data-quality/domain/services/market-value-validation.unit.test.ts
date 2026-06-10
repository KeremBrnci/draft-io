import { describe, expect, it } from 'vitest';

import {
  isValidStoredMarketValue,
  parseProviderMarketValue,
  hasValidPlayerPosition,
} from './market-value-validation';

describe('market-value-validation', () => {
  it('parses numeric and suffixed market values', () => {
    expect(parseProviderMarketValue(5_000_000)).toBe(5_000_000);
    expect(parseProviderMarketValue('5.5m')).toBe(5_500_000);
    expect(parseProviderMarketValue('250k')).toBe(250_000);
  });

  it('rejects invalid market values', () => {
    expect(parseProviderMarketValue(-1)).toBeNull();
    expect(parseProviderMarketValue('not-a-value')).toBeNull();
    expect(isValidStoredMarketValue(-10)).toBe(false);
  });

  it('validates player positions', () => {
    expect(hasValidPlayerPosition('ST')).toBe(true);
    expect(hasValidPlayerPosition('UNK')).toBe(false);
    expect(hasValidPlayerPosition('')).toBe(false);
  });
});
