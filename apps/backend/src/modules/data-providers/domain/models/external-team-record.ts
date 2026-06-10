import type { ExternalProvider } from '../../../../core/external-reference/external-provider';

export interface ExternalTeamRecord {
  readonly provider: ExternalProvider;
  readonly slug: string;
  readonly externalId: string;
  readonly name: string;
  readonly shortName: string | null;
  readonly countryExternalId: string | null;
  readonly leagueExternalId: string | null;
  readonly country: string | null;
  readonly logoUrl: string | null;
}
