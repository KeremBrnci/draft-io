export interface ImportLeagueBatchItem {
  readonly provider: string;
  readonly slug: string;
  readonly externalId: string;
  readonly name: string;
  readonly country?: string | null;
}

export interface ImportLeaguesBatchCommand {
  readonly items: readonly ImportLeagueBatchItem[];
}
