import { ExternalProvider } from '../../../../../core/external-reference/external-provider';
import type { ExternalCountryRecord } from '../../../domain/models/external-country-record';

/**
 * felipeall/transfermarkt-api has no /countries endpoint.
 * Seed uses Transfermarkt country IDs for admin import bootstrap.
 */
export const TRANSFERMARKT_COUNTRY_SEED: readonly ExternalCountryRecord[] = [
  { provider: ExternalProvider.TRANSFERMARKT, externalId: '40', name: 'Germany' },
  { provider: ExternalProvider.TRANSFERMARKT, externalId: '189', name: 'England' },
  { provider: ExternalProvider.TRANSFERMARKT, externalId: '157', name: 'Spain' },
  { provider: ExternalProvider.TRANSFERMARKT, externalId: '75', name: 'Italy' },
  { provider: ExternalProvider.TRANSFERMARKT, externalId: '50', name: 'France' },
  { provider: ExternalProvider.TRANSFERMARKT, externalId: '174', name: 'Turkey' },
  { provider: ExternalProvider.TRANSFERMARKT, externalId: '122', name: 'Netherlands' },
  { provider: ExternalProvider.TRANSFERMARKT, externalId: '136', name: 'Portugal' },
  { provider: ExternalProvider.TRANSFERMARKT, externalId: '19', name: 'Belgium' },
  { provider: ExternalProvider.TRANSFERMARKT, externalId: '184', name: 'United States' },
  { provider: ExternalProvider.TRANSFERMARKT, externalId: '26', name: 'Brazil' },
  { provider: ExternalProvider.TRANSFERMARKT, externalId: '9', name: 'Argentina' },
] as const;

export function findTransfermarktCountryByExternalId(
  externalId: string,
): ExternalCountryRecord | undefined {
  return TRANSFERMARKT_COUNTRY_SEED.find((country) => country.externalId === externalId);
}
