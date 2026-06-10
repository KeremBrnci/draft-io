import { describe, expect, it } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { LeagueExternalReference } from './external-reference.vo';

describe('LeagueExternalReference', () => {
  it('creates reference', () => {
    const ref = LeagueExternalReference.create(ExternalProvider.SPORTDB, 'league-1');
    expect(ref.externalId).toBe('league-1');
  });
});
