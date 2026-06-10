import { ExternalProvider } from '../../../../../core/external-reference/external-provider';
import type { ExternalTeamRecord } from '../../../domain/models/external-team-record';
import type { SportDbTeamDto } from '../dtos/sportdb-team.dto';

export function toExternalTeamRecord(dto: SportDbTeamDto): ExternalTeamRecord {
  return {
    provider: ExternalProvider.SPORTDB,
    slug: dto.slug,
    externalId: dto.id,
    name: dto.name,
    shortName: dto.shortName,
    countryExternalId: null,
    leagueExternalId: null,
    country: dto.country,
    logoUrl: dto.logoUrl,
  };
}
