import { describe, expect, it } from 'vitest';

import { InvalidFormationCodeError } from '../errors/formation.errors';

import { FormationCode } from './formation-code.vo';

describe('FormationCode', () => {
  it('creates a valid formation code', () => {
    const code = FormationCode.create('4-4-2');
    expect(code.value).toBe('4-4-2');
  });

  it('rejects unknown formation codes', () => {
    expect(() => FormationCode.create('9-9-9')).toThrow(InvalidFormationCodeError);
  });
});
