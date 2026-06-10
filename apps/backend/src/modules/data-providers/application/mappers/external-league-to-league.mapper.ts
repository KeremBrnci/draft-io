import { v4 as uuidv4 } from 'uuid';

import { League } from '../../../leagues/domain/entities/league.entity';
import { LeagueExternalReference } from '../../../leagues/domain/value-objects/external-reference.vo';
import { LeagueId } from '../../../leagues/domain/value-objects/league-id.vo';
import { LeagueName } from '../../../leagues/domain/value-objects/league-name.vo';
import type { ExternalLeagueRecord } from '../../domain/models/external-league-record';

export interface ExternalLeagueMappingContext {
  readonly countryId: string | null;
}

export function mapExternalLeagueToDomain(
  record: ExternalLeagueRecord,
  context: ExternalLeagueMappingContext,
): League {
  return League.create({
    id: LeagueId.create(uuidv4()),
    externalReference: LeagueExternalReference.create(record.provider, record.externalId),
    name: LeagueName.create(record.name),
    slug: record.slug,
    countryId: context.countryId,
    country: record.country,
    logoUrl: record.logoUrl,
  });
}

export function applyExternalLeagueImport(
  existing: League,
  record: ExternalLeagueRecord,
  context: ExternalLeagueMappingContext,
): League {
  return League.reconstitute({
    id: existing.id,
    externalReference: LeagueExternalReference.create(record.provider, record.externalId),
    name: LeagueName.create(record.name),
    slug: record.slug,
    countryId: context.countryId,
    country: record.country,
    logoUrl: record.logoUrl,
    createdAt: existing.createdAt,
    updatedAt: new Date(),
  });
}
