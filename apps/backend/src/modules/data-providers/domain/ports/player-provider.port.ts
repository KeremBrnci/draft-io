import type { ExternalPlayerRecord } from '../models/external-player-record';
import type { PlayerSearchResult } from '../models/player-search-result';

/**
 * Fetches player data from an external provider.
 * Implementations live in infrastructure — no HTTP calls in domain/application.
 */
export interface PlayerProvider {
  searchPlayers(query: string): Promise<readonly PlayerSearchResult[]>;
  fetchBySlugAndId(slug: string, externalId: string): Promise<ExternalPlayerRecord | null>;
  fetchProfile?(externalId: string): Promise<ExternalPlayerRecord | null>;
  fetchClubPlayers?(
    clubExternalId: string,
    leagueExternalId?: string | null,
  ): Promise<readonly ExternalPlayerRecord[]>;
}

export const PLAYER_PROVIDER = Symbol('PLAYER_PROVIDER');
