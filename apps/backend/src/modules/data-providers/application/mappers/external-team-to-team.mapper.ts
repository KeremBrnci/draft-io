import { v4 as uuidv4 } from 'uuid';

import { Team } from '../../../teams/domain/entities/team.entity';
import { TeamExternalReference } from '../../../teams/domain/value-objects/external-reference.vo';
import { TeamId } from '../../../teams/domain/value-objects/team-id.vo';
import { TeamName } from '../../../teams/domain/value-objects/team-name.vo';
import { TeamShortName } from '../../../teams/domain/value-objects/team-short-name.vo';
import type { ExternalTeamRecord } from '../../domain/models/external-team-record';

export interface ExternalTeamMappingContext {
  readonly countryId: string | null;
  readonly leagueId: string | null;
}

function toOptionalTeamShortName(value: string | null): TeamShortName | null {
  if (value === null) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed.length === 0 || trimmed.length > 32) {
    return null;
  }

  return TeamShortName.create(trimmed);
}

export function mapExternalTeamToDomain(
  record: ExternalTeamRecord,
  context: ExternalTeamMappingContext,
): Team {
  return Team.create({
    id: TeamId.create(uuidv4()),
    externalReference: TeamExternalReference.create(record.provider, record.externalId),
    name: TeamName.create(record.name),
    shortName: toOptionalTeamShortName(record.shortName),
    countryId: context.countryId,
    leagueId: context.leagueId,
    country: record.country,
    logoUrl: record.logoUrl,
  });
}

export function applyExternalTeamImport(
  existing: Team,
  record: ExternalTeamRecord,
  context: ExternalTeamMappingContext,
): Team {
  return Team.reconstitute({
    id: existing.id,
    externalReference: TeamExternalReference.create(record.provider, record.externalId),
    name: TeamName.create(record.name),
    shortName: toOptionalTeamShortName(record.shortName),
    countryId: context.countryId,
    leagueId: context.leagueId,
    country: record.country,
    logoUrl: record.logoUrl,
    formationCode: existing.formationCode,
    manager: existing.manager,
    startingEleven: existing.startingEleven,
    chemistryScore: existing.chemistryScore,
    teamOverall: existing.teamOverall,
    createdAt: existing.createdAt,
    updatedAt: new Date(),
  });
}
