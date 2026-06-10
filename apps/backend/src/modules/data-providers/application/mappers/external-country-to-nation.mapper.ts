import { v4 as uuidv4 } from 'uuid';

import { Nation } from '../../../nations/domain/entities/nation.entity';
import { NationExternalReference } from '../../../nations/domain/value-objects/external-reference.vo';
import { NationId } from '../../../nations/domain/value-objects/nation-id.vo';
import { NationName } from '../../../nations/domain/value-objects/nation-name.vo';
import type { ExternalCountryRecord } from '../../domain/models/external-country-record';

export function mapExternalCountryToDomain(record: ExternalCountryRecord): Nation {
  return Nation.create({
    id: NationId.create(uuidv4()),
    externalReference: NationExternalReference.create(record.provider, record.externalId),
    name: NationName.create(record.name),
    code: null,
  });
}

export function applyExternalCountryImport(existing: Nation, record: ExternalCountryRecord): Nation {
  return Nation.reconstitute({
    id: existing.id,
    externalReference: NationExternalReference.create(record.provider, record.externalId),
    name: NationName.create(record.name),
    code: existing.code,
    createdAt: existing.createdAt,
    updatedAt: new Date(),
  });
}
