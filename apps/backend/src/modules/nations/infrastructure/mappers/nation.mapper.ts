import type { Country as PrismaCountry } from '@prisma/client';

import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import { Nation } from '../../domain/entities/nation.entity';
import { NationExternalReference } from '../../domain/value-objects/external-reference.vo';
import { NationId } from '../../domain/value-objects/nation-id.vo';
import { NationName } from '../../domain/value-objects/nation-name.vo';

export function toNationDomain(record: PrismaCountry): Nation {
  const externalReference =
    record.provider !== null && record.externalId !== null
      ? NationExternalReference.create(parseExternalProvider(record.provider), record.externalId)
      : null;

  return Nation.reconstitute({
    id: NationId.create(record.id),
    externalReference,
    name: NationName.create(record.name),
    code: null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toNationPersistence(nation: Nation): {
  id: string;
  provider: string | null;
  externalId: string | null;
  name: string;
  createdAt: Date;
  updatedAt: Date;
} {
  return {
    id: nation.id.value,
    provider: nation.externalReference?.provider ?? null,
    externalId: nation.externalReference?.externalId ?? null,
    name: nation.name.value,
    createdAt: nation.createdAt,
    updatedAt: nation.updatedAt,
  };
}
