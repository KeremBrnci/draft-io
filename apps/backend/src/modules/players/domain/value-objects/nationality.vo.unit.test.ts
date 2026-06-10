import { describe, expect, it } from 'vitest';

import { InvalidNationalityError } from '../errors/player.errors';
import { Nationality } from './nationality.vo';

describe('Nationality', () => {
  it('uppercases country code', () => {
    expect(Nationality.create('ar').value).toBe('AR');
  });

  it('rejects empty nationality', () => {
    expect(() => Nationality.create('  ')).toThrow(InvalidNationalityError);
  });
});
