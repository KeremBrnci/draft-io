import { describe, expect, it } from 'vitest';

import { InvalidMarketValueError } from '../errors/player.errors';
import { MarketValue } from './market-value.vo';

describe('MarketValue', () => {
  it('accepts non-negative values', () => {
    expect(MarketValue.create(1_000_000).value).toBe(1_000_000);
  });

  it('rejects negative values', () => {
    expect(() => MarketValue.create(-1)).toThrow(InvalidMarketValueError);
  });
});
