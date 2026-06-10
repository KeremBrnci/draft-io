export interface ImportPlayerBatchItem {
  readonly provider: string;
  readonly slug: string;
  readonly externalId: string;
}

export interface ImportPlayersBatchCommand {
  readonly items: readonly ImportPlayerBatchItem[];
}
