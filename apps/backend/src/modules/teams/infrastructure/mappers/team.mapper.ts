import type { Team as PrismaTeam } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import { Team } from '../../domain/entities/team.entity';
import { TeamExternalReference } from '../../domain/value-objects/external-reference.vo';
import { StartingEleven } from '../../domain/value-objects/starting-eleven.vo';
import { TeamId } from '../../domain/value-objects/team-id.vo';
import { TeamName } from '../../domain/value-objects/team-name.vo';
import { TeamShortName } from '../../domain/value-objects/team-short-name.vo';

export function toTeamDomain(record: PrismaTeam): Team {
  const externalReference =
    record.provider !== null && record.externalId !== null
      ? TeamExternalReference.create(parseExternalProvider(record.provider), record.externalId)
      : null;

  return Team.reconstitute({
    id: TeamId.create(record.id),
    externalReference,
    name: TeamName.create(record.name),
    shortName: record.shortName === null ? null : TeamShortName.create(record.shortName),
    countryId: record.countryId,
    leagueId: record.leagueId,
    country: record.country,
    logoUrl: record.logoUrl,
    formationCode: record.formationCode,
    manager: record.manager,
    startingEleven: parseStartingEleven(record.startingEleven),
    chemistryScore: record.chemistryScore,
    teamOverall: record.teamOverall,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toTeamPersistence(team: Team) {
  return {
    id: team.id.value,
    provider: team.externalReference?.provider ?? null,
    externalId: team.externalReference?.externalId ?? null,
    name: team.name.value,
    shortName: team.shortName?.value ?? null,
    countryId: team.countryId,
    leagueId: team.leagueId,
    country: team.country,
    logoUrl: team.logoUrl,
    formationCode: team.formationCode,
    manager: team.manager,
    startingEleven:
      team.startingEleven === null
        ? Prisma.JsonNull
        : { playerIds: [...team.startingEleven.playerIds] },
    chemistryScore: team.chemistryScore,
    teamOverall: team.teamOverall,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
  };
}

function parseStartingEleven(value: unknown): StartingEleven | null {
  if (value === null) {
    return null;
  }

  if (Array.isArray(value)) {
    return StartingEleven.create(value as (string | null)[]);
  }

  if (typeof value === 'object' && 'playerIds' in value && Array.isArray(value.playerIds)) {
    return StartingEleven.create(value.playerIds as (string | null)[]);
  }

  return null;
}
