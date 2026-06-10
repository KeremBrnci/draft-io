import { describe, expect, it } from 'vitest';

import { ExternalProvider } from '../../../../core/external-reference/external-provider';
import { LeagueExternalReference } from '../value-objects/external-reference.vo';
import { LeagueId } from '../value-objects/league-id.vo';
import { LeagueName } from '../value-objects/league-name.vo';
import { League } from './league.entity';

describe('League', () => {
  it('creates imported league', () => {
    const league = League.create({
      id: LeagueId.create('550e8400-e29b-41d4-a716-446655440020'),
      externalReference: LeagueExternalReference.create(ExternalProvider.SPORTDB, 'league-1'),
      name: LeagueName.create('Premier League'),
      slug: 'premier-league',
      countryId: null,
      country: 'GB',
      logoUrl: null,
    });

    expect(league.externalReference?.externalId).toBe('league-1');
    expect(league.country).toBe('GB');
  });

  it('reconstitutes from persistence props', () => {
    const createdAt = new Date('2024-01-01');
    const league = League.reconstitute({
      id: LeagueId.create('550e8400-e29b-41d4-a716-446655440020'),
      externalReference: null,
      name: LeagueName.create('Serie A'),
      slug: null,
      countryId: null,
      country: 'IT',
      logoUrl: 'https://example.com/logo.png',
      createdAt,
      updatedAt: createdAt,
    });

    expect(league.logoUrl).toContain('https://');
  });
});
