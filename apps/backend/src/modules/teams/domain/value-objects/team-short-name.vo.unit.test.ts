import { describe, expect, it } from 'vitest';

import { TeamShortName } from './team-short-name.vo';

describe('TeamShortName', () => {
  it('trims short name', () => {
    expect(TeamShortName.create('  BAR  ').value).toBe('BAR');
  });
});
