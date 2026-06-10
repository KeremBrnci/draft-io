import type { ExternalCountryRecord } from '../models/external-country-record';

export interface CountryProvider {
  listCountries(): Promise<readonly ExternalCountryRecord[]>;
}

export const COUNTRY_PROVIDER = Symbol('COUNTRY_PROVIDER');
