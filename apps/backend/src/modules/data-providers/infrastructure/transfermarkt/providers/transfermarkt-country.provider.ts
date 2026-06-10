import { Injectable } from '@nestjs/common';

import type { ExternalCountryRecord } from '../../../domain/models/external-country-record';
import type { CountryProvider } from '../../../domain/ports/country-provider.port';
import { TRANSFERMARKT_COUNTRY_SEED } from '../data/transfermarkt-countries.seed';

@Injectable()
export class TransfermarktCountryProvider implements CountryProvider {
  async listCountries(): Promise<readonly ExternalCountryRecord[]> {
    return TRANSFERMARKT_COUNTRY_SEED;
  }
}
