import { describe, expect, it } from 'vitest';

import { PersonName } from './person-name.vo';

describe('PersonName', () => {
  it('trims name', () => {
    expect(PersonName.create('  Lionel  ').value).toBe('Lionel');
  });
});
