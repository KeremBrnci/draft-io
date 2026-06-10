import { ExternalProvider } from '../../../../../core/external-reference/external-provider';
import type { ExternalPlayerRecord } from '../../../domain/models/external-player-record';
import type { SportDbPlayerDto } from '../dtos/sportdb-player.dto';

/**
 * Maps SportDB DTO → provider-neutral external record.
 * Forbidden: mapping directly to Player domain entity.
 */
export function toExternalPlayerRecord(dto: SportDbPlayerDto): ExternalPlayerRecord {
  return {
    provider: ExternalProvider.SPORTDB,
    slug: dto.slug,
    externalId: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName,
    displayName: dto.displayName,
    nationality: dto.nationality,
    teamExternalId: dto.teamId,
    leagueExternalId: dto.leagueId,
    primaryPosition: dto.primaryPosition,
    secondaryPositions: dto.secondaryPositions,
    age: dto.age,
    apiOverallHint: dto.overall,
    marketValue: dto.marketValue,
    marketValueCurrency: null,
    imageUrl: dto.imageUrl,
    status: dto.status,
  };
}
