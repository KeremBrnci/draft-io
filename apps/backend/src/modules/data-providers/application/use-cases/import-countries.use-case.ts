import { parseExternalProvider } from '../../../../core/external-reference/external-provider';
import type { Nation } from '../../../nations/domain/entities/nation.entity';
import type { NationRepository } from '../../../nations/domain/repositories/nation.repository';
import type { ProviderRegistryPort } from '../../domain/ports/provider-registry.port';
import {
  applyExternalCountryImport,
  mapExternalCountryToDomain,
} from '../mappers/external-country-to-nation.mapper';

export interface ImportCountriesCommand {
  readonly provider: string;
}

export class ImportCountriesUseCase {
  constructor(
    private readonly providerRegistry: ProviderRegistryPort,
    private readonly nationRepository: NationRepository,
  ) {}

  async execute(command: ImportCountriesCommand): Promise<readonly Nation[]> {
    parseExternalProvider(command.provider);
    const records = await this.providerRegistry
      .getCountryProvider(command.provider)
      .listCountries();

    const nations: Nation[] = [];

    for (const record of records) {
      const existing = await this.nationRepository.findByExternalReference(
        record.provider,
        record.externalId,
      );

      const nation =
        existing === null
          ? mapExternalCountryToDomain(record)
          : applyExternalCountryImport(existing, record);

      await this.nationRepository.save(nation);
      nations.push(nation);
    }

    return nations;
  }
}
