import { describe, expect, it } from 'vitest';

import { InvalidOverallRatingError } from '../errors/player.errors';

import { OverallRating } from './overall-rating.vo';

describe('OverallRating', () => {
  it('accepts valid ratings', () => {
    expect(OverallRating.create(1).value).toBe(1);
    expect(OverallRating.create(99).value).toBe(99);
    expect(OverallRating.create(50).value).toBe(50);
  });

  it('rejects ratings below minimum', () => {
    expect(() => OverallRating.create(0)).toThrow(InvalidOverallRatingError);
  });

  it('rejects ratings above maximum', () => {
    expect(() => OverallRating.create(100)).toThrow(InvalidOverallRatingError);
  });

  it('rejects non-integer ratings', () => {
    expect(() => OverallRating.create(85.5)).toThrow(InvalidOverallRatingError);
  });
});
