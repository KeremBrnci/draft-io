export interface PlayerSearchResult {
  readonly slug: string;
  readonly externalId: string;
  readonly displayName: string;
  readonly nationality: string | null;
  readonly teamName: string | null;
}
