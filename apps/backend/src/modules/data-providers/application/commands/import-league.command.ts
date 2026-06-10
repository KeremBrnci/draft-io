export interface ImportLeagueCommand {
  readonly provider: string;
  readonly slug: string;
  readonly externalId: string;
  readonly name: string;
  readonly country?: string | null;
  readonly countryExternalId?: string | null;
}
