import { describe, expect, it } from 'vitest';

import { InvalidCardOverallError } from '../errors/card.errors';

import { CardOverall } from './card-overall.vo';

describe('CardOverall', () => {
  it('accepts gameplay strength in 1-99 range', () => {
    expect(CardOverall.create(99).value).toBe(99);
  });

  it('rejects out-of-range values', () => {
    expect(() => CardOverall.create(0)).toThrow(InvalidCardOverallError);
    expect(() => CardOverall.create(100)).toThrow(InvalidCardOverallError);
  });
});
