import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { NationRepository } from '../../../nations/domain/repositories/nation.repository';
import type { ExternalCountryRecord } from '../../domain/models/external-country-record';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';

export interface ListProviderCountriesQuery {
  readonly provider: string;
}

export interface CountryImportView {
  readonly externalId: string;
  readonly name: string;
  readonly imported: boolean;
}

export class ListProviderCountriesUseCase {
  constructor(
    private readonly providerRegistry: ProviderRegistryPort,
    private readonly nationRepository: NationRepository,
  ) {}

  async execute(query: ListProviderCountriesQuery): Promise<readonly CountryImportView[]> {
    const provider = parseExternalProvider(query.provider);
    const records = await this.providerRegistry.getCountryProvider(provider).listCountries();
    const nations = await this.nationRepository.findAll();

    const importedExternalIds = new Set(
      nations
        .filter((nation) => nation.externalReference?.provider === provider)
        .map((nation) => nation.externalReference?.externalId)
        .filter((externalId): externalId is string => externalId !== undefined),
    );

    return records.map((record) => toCountryImportView(record, importedExternalIds));
  }
}

function toCountryImportView(
  record: ExternalCountryRecord,
  importedExternalIds: ReadonlySet<string>,
): CountryImportView {
  return {
    externalId: record.externalId,
    name: record.name,
    imported: importedExternalIds.has(record.externalId),
  };
}
