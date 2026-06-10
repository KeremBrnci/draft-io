import type { ExternalProvider } from '../../../../core/external-reference/external-provider';

/**
 * Provider-neutral player payload produced by adapters.
 * Never persisted directly — mapped to domain entities in application layer.
 *
 * apiOverallHint is metadata from the provider only.
 * The game engine must never assign overall from this value directly.
 */
export interface ExternalPlayerRecord {
  readonly provider: ExternalProvider;
  readonly slug: string;
  readonly externalId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName: string;
  readonly nationality: string;
  readonly teamExternalId: string | null;
  readonly leagueExternalId: string | null;
  readonly primaryPosition: string;
  readonly secondaryPositions: readonly string[];
  readonly age: number | null;
  readonly dateOfBirth?: string | null;
  /** Provider-reported rating hint — input to overall engine only, never trusted as game overall */
  readonly apiOverallHint: number | null;
  readonly marketValue: number | null;
  readonly marketValueCurrency: string | null;
  readonly imageUrl: string | null;
  readonly status: string;
}
