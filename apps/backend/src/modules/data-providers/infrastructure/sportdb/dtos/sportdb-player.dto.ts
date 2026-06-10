/**
 * Raw sportdb.dev player shape (contract only — no live API integration yet).
 * @see https://sportdb.dev
 */
export interface SportDbPlayerDto {
  readonly id: string;
  readonly slug: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName: string;
  readonly nationality: string;
  readonly teamId: string | null;
  readonly leagueId: string | null;
  readonly primaryPosition: string;
  readonly secondaryPositions: readonly string[];
  readonly age: number | null;
  /** Provider rating — never mapped directly to game overall */
  readonly overall: number | null;
  readonly marketValue: number | null;
  readonly imageUrl: string | null;
  readonly status: string;
}
