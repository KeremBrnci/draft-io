export interface ImportTeamBatchItem {
  readonly provider: string;
  readonly slug: string;
  readonly externalId: string;
}

export interface ImportTeamsBatchCommand {
  readonly items: readonly ImportTeamBatchItem[];
}
