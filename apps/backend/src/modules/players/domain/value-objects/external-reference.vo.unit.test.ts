import { describe, expect, it } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { InvalidExternalReferenceError } from '../errors/player.errors';
import { ExternalReference } from './external-reference.vo';

describe('ExternalReference', () => {
  it('stores provider and external id', () => {
    const ref = ExternalReference.create(ExternalProvider.SPORTDB, 'vgOOdZbd');
    expect(ref.provider).toBe(ExternalProvider.SPORTDB);
    expect(ref.externalId).toBe('vgOOdZbd');
  });

  it('rejects empty external id', () => {
    expect(() => ExternalReference.create(ExternalProvider.SPORTDB, '  ')).toThrow(
      InvalidExternalReferenceError,
    );
  });
});
