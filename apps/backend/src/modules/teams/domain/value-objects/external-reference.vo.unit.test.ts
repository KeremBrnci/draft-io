import { describe, expect, it } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { TeamExternalReference } from './external-reference.vo';

describe('TeamExternalReference', () => {
  it('creates reference', () => {
    const ref = TeamExternalReference.create(ExternalProvider.SPORTDB, 'team-1');
    expect(ref.externalId).toBe('team-1');
  });
});
