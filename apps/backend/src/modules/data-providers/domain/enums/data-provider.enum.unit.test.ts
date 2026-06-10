import { describe, expect, it } from 'vitest';

import { DataProvider, isDataProvider } from './data-provider.enum';

describe('DataProvider', () => {
  it('includes SportDB and future provider slots', () => {
    expect(DataProvider.SPORTDB).toBe('SPORTDB');
    expect(isDataProvider('SPORTMONKS')).toBe(true);
    expect(isDataProvider('INVALID')).toBe(false);
  });
});
