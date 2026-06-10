import type { ExternalProvider } from '../../../../core/external-reference/external-provider';

export interface ExternalLeagueRecord {
  readonly provider: ExternalProvider;
  readonly slug: string;
  readonly externalId: string;
  readonly name: string;
  readonly countryExternalId: string | null;
  readonly country: string | null;
  readonly logoUrl: string | null;
}
