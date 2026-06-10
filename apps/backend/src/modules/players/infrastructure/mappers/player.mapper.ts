import type {
  Player as PrismaPlayer,
  PlayerPosition as PrismaPlayerPosition,
} from '@prisma/client';
import { type Decimal } from '@prisma/client/runtime/library';

import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import { Player } from '../../domain/entities/player.entity';
import { parsePlayerStatus } from '../../domain/enums/player-status.enum';
import { BirthDate } from '../../domain/value-objects/birth-date.vo';
import { DisplayName } from '../../domain/value-objects/display-name.vo';
import { ExternalReference } from '../../domain/value-objects/external-reference.vo';
import { ImageUrl } from '../../domain/value-objects/image-url.vo';
import { MarketValue } from '../../domain/value-objects/market-value.vo';
import { Nationality } from '../../domain/value-objects/nationality.vo';
import { PersonName } from '../../domain/value-objects/person-name.vo';
import { PlayerId } from '../../domain/value-objects/player-id.vo';

import { toPlayerPositionsDomain } from './player-position.mapper';

export type PrismaPlayerWithPositions = PrismaPlayer & {
  readonly positions: readonly PrismaPlayerPosition[];
};

export function toPlayerDomain(record: PrismaPlayerWithPositions): Player {
  const playerId = PlayerId.create(record.id);
  const externalReference =
    record.provider !== null && record.externalId !== null
      ? ExternalReference.create(parseExternalProvider(record.provider), record.externalId)
      : null;

  return Player.reconstitute({
    id: playerId,
    externalReference,
    firstName: PersonName.create(record.firstName),
    lastName: PersonName.create(record.lastName),
    displayName: DisplayName.create(record.displayName),
    birthDate: record.birthDate === null ? null : BirthDate.create(record.birthDate),
    nationality: Nationality.create(record.nationality),
    countryId: record.countryId,
    teamId: record.teamId,
    leagueId: record.leagueId,
    positions: toPlayerPositionsDomain(playerId, record.positions),
    marketValue:
      record.marketValue === null ? null : MarketValue.create(decimalToNumber(record.marketValue)),
    marketValueCurrency: record.marketValueCurrency,
    imageUrl: record.imageUrl === null ? null : ImageUrl.create(record.imageUrl),
    status: parsePlayerStatus(record.status),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toPlayerPersistence(player: Player): {
  id: string;
  provider: string | null;
  externalId: string | null;
  firstName: string;
  lastName: string;
  displayName: string;
  birthDate: Date | null;
  nationality: string;
  countryId: string | null;
  teamId: string | null;
  leagueId: string | null;
  marketValue: string | null;
  marketValueCurrency: string | null;
  imageUrl: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
} {
  return {
    id: player.id.value,
    provider: player.externalReference?.provider ?? null,
    externalId: player.externalReference?.externalId ?? null,
    firstName: player.firstName.value,
    lastName: player.lastName.value,
    displayName: player.displayName.value,
    birthDate: player.birthDate?.value ?? null,
    nationality: player.nationality.value,
    countryId: player.countryId,
    teamId: player.teamId,
    leagueId: player.leagueId,
    marketValue: player.marketValue === null ? null : player.marketValue.value.toFixed(2),
    marketValueCurrency: player.marketValueCurrency,
    imageUrl: player.imageUrl?.value ?? null,
    status: player.status,
    createdAt: player.createdAt,
    updatedAt: player.updatedAt,
  };
}

function decimalToNumber(value: Decimal): number {
  return Number(value.toString());
}
