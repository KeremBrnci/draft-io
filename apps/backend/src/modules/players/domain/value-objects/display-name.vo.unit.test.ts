import { describe, expect, it } from 'vitest';

import { InvalidDisplayNameError } from '../errors/player.errors';

import { DisplayName } from './display-name.vo';
import { PersonName } from './person-name.vo';

describe('DisplayName', () => {
  it('creates from string', () => {
    expect(DisplayName.create('  Lionel Messi  ').value).toBe('Lionel Messi');
  });

  it('creates from name parts', () => {
    const name = DisplayName.fromParts(PersonName.create('Lionel'), PersonName.create('Messi'));
    expect(name.value).toBe('Lionel Messi');
  });

  it('rejects empty names', () => {
    expect(() => DisplayName.create('   ')).toThrow(InvalidDisplayNameError);
  });
});
