import type { League as PrismaLeague } from '@prisma/client';

import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import { League } from '../../domain/entities/league.entity';
import { LeagueExternalReference } from '../../domain/value-objects/external-reference.vo';
import { LeagueId } from '../../domain/value-objects/league-id.vo';
import { LeagueName } from '../../domain/value-objects/league-name.vo';

export function toLeagueDomain(record: PrismaLeague): League {
  const externalReference =
    record.provider !== null && record.externalId !== null
      ? LeagueExternalReference.create(parseExternalProvider(record.provider), record.externalId)
      : null;

  return League.reconstitute({
    id: LeagueId.create(record.id),
    externalReference,
    name: LeagueName.create(record.name),
    slug: record.slug,
    countryId: record.countryId,
    country: record.country,
    logoUrl: record.logoUrl,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toLeaguePersistence(league: League) {
  return {
    id: league.id.value,
    provider: league.externalReference?.provider ?? null,
    externalId: league.externalReference?.externalId ?? null,
    slug: league.slug,
    name: league.name.value,
    countryId: league.countryId,
    country: league.country,
    logoUrl: league.logoUrl,
    createdAt: league.createdAt,
    updatedAt: league.updatedAt,
  };
}
