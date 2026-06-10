import { v4 as uuidv4 } from 'uuid';

import { mapExternalPlayerPositions } from '../../../players/application/mappers/map-external-player-positions';
import { Player } from '../../../players/domain/entities/player.entity';
import { parsePlayerStatus } from '../../../players/domain/enums/player-status.enum';
import { BirthDate } from '../../../players/domain/value-objects/birth-date.vo';
import { DisplayName } from '../../../players/domain/value-objects/display-name.vo';
import { ExternalReference } from '../../../players/domain/value-objects/external-reference.vo';
import { ImageUrl } from '../../../players/domain/value-objects/image-url.vo';
import { MarketValue } from '../../../players/domain/value-objects/market-value.vo';
import { Nationality } from '../../../players/domain/value-objects/nationality.vo';
import { PersonName } from '../../../players/domain/value-objects/person-name.vo';
import { PlayerId } from '../../../players/domain/value-objects/player-id.vo';
import { PlayerPositionId } from '../../../players/domain/value-objects/player-position-id.vo';
import { PlayerPositions } from '../../../players/domain/value-objects/player-positions.vo';
import type { ExternalPlayerRecord } from '../../domain/models/external-player-record';

export interface ExternalPlayerMappingContext {
  readonly countryId: string | null;
  readonly teamId: string | null;
  readonly leagueId: string | null;
}

function mergeExternalPlayerPositions(
  existing: Player,
  record: Pick<ExternalPlayerRecord, 'primaryPosition' | 'secondaryPositions'>,
): ReturnType<typeof mapExternalPlayerPositions> {
  const mapped = mapExternalPlayerPositions(existing.id, record);

  if (record.secondaryPositions.length > 0) {
    return mapped;
  }

  if (existing.positions.secondaryCodes.length === 0) {
    return mapped;
  }

  return PlayerPositions.fromPrimaryAndSecondary(
    existing.id,
    () => PlayerPositionId.generate(uuidv4()),
    mapped.primaryCode,
    existing.positions.secondaryCodes,
  );
}

function resolveBirthDate(record: ExternalPlayerRecord): BirthDate | null {
  if (record.dateOfBirth !== undefined && record.dateOfBirth !== null && record.dateOfBirth.length > 0) {
    try {
      return BirthDate.create(new Date(record.dateOfBirth));
    } catch {
      // fall through to age-based estimate
    }
  }

  if (record.age === null) {
    return null;
  }

  try {
    return BirthDate.fromAge(record.age);
  } catch {
    return null;
  }
}

export function mapExternalPlayerToDomain(
  record: ExternalPlayerRecord,
  context: ExternalPlayerMappingContext,
): Player {
  const playerId = PlayerId.generate(uuidv4());

  return Player.create({
    id: playerId,
    externalReference: ExternalReference.create(record.provider, record.externalId),
    firstName: PersonName.create(record.firstName),
    lastName: PersonName.create(record.lastName),
    displayName: DisplayName.create(record.displayName),
    birthDate: resolveBirthDate(record),
    nationality: Nationality.create(record.nationality),
    countryId: context.countryId,
    teamId: context.teamId,
    leagueId: context.leagueId,
    positions: mapExternalPlayerPositions(playerId, record),
    marketValue: record.marketValue === null ? null : MarketValue.create(record.marketValue),
    marketValueCurrency: record.marketValueCurrency,
    imageUrl: record.imageUrl === null ? null : ImageUrl.create(record.imageUrl),
    status: parsePlayerStatus(record.status),
  });
}

export function applyExternalPlayerImport(
  existing: Player,
  record: ExternalPlayerRecord,
  context: ExternalPlayerMappingContext,
): Player {
  return Player.reconstitute({
    id: existing.id,
    externalReference: ExternalReference.create(record.provider, record.externalId),
    firstName: PersonName.create(
      record.firstName.trim().length > 0 ? record.firstName : existing.firstName.value,
    ),
    lastName: PersonName.create(
      record.lastName.trim().length > 0 ? record.lastName : existing.lastName.value,
    ),
    displayName: DisplayName.create(
      record.displayName.trim().length > 0 ? record.displayName : existing.displayName.value,
    ),
    birthDate: resolveBirthDate(record) ?? existing.birthDate,
    nationality:
      record.nationality.trim().toUpperCase() === 'UNKNOWN'
        ? existing.nationality
        : Nationality.create(record.nationality),
    countryId: context.countryId ?? existing.countryId,
    teamId: context.teamId ?? existing.teamId,
    leagueId: context.leagueId ?? existing.leagueId,
    positions: mergeExternalPlayerPositions(existing, record),
    marketValue:
      record.marketValue === null
        ? existing.marketValue
        : MarketValue.create(record.marketValue),
    marketValueCurrency: record.marketValueCurrency ?? existing.marketValueCurrency,
    imageUrl:
      record.imageUrl === null ? existing.imageUrl : ImageUrl.create(record.imageUrl),
    status: parsePlayerStatus(record.status),
    createdAt: existing.createdAt,
    updatedAt: new Date(),
  });
}
