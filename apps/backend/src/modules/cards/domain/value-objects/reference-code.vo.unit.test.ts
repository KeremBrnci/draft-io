import { describe, expect, it } from 'vitest';

import { InvalidReferenceCodeError } from '../errors/card.errors';

import { ReferenceCode } from './reference-code.vo';

describe('ReferenceCode', () => {
  it('normalizes codes to uppercase', () => {
    expect(ReferenceCode.create('toty').value).toBe('TOTY');
  });

  it('accepts promotion codes with underscores', () => {
    expect(ReferenceCode.create('PRIME_ICON').value).toBe('PRIME_ICON');
    expect(ReferenceCode.create('ROAD_TO_FINAL').value).toBe('ROAD_TO_FINAL');
  });

  it('rejects invalid codes', () => {
    expect(() => ReferenceCode.create('')).toThrow(InvalidReferenceCodeError);
    expect(() => ReferenceCode.create('invalid-code')).toThrow(InvalidReferenceCodeError);
  });
});
