import type { PaginationParams } from '@draft-io/shared-types';

import type { ExternalProvider } from '../../../../core/external-reference/external-provider';
import type { Player } from '../entities/player.entity';
import type { PlayerId } from '../value-objects/player-id.vo';

export type PlayerSortField = 'name' | 'age' | 'marketValue' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export interface PlayerListFilter {
  readonly name?: string;
  /** Matches any assigned position (primary or secondary). */
  readonly position?: string;
  /** Matches primary position only. */
  readonly primaryPosition?: string;
  /** Matches secondary position only. */
  readonly secondaryPosition?: string;
  /** Players with more than one assigned position. */
  readonly hasMultiplePositions?: boolean;
  readonly teamId?: string;
  readonly leagueId?: string;
  readonly nationality?: string;
  readonly minAge?: number;
  readonly maxAge?: number;
  readonly minMarketValue?: number;
  readonly maxMarketValue?: number;
  readonly hasImage?: boolean;
  readonly hasMarketValue?: boolean;
  readonly hasPosition?: boolean;
  readonly hasAge?: boolean;
}

export interface PlayerListSort {
  readonly field: PlayerSortField;
  readonly direction: SortDirection;
}

export interface PlayerPageResult {
  readonly items: readonly Player[];
  readonly totalItems: number;
}

export interface PlayerRepository {
  findById(id: PlayerId): Promise<Player | null>;
  findByExternalReference(provider: ExternalProvider, externalId: string): Promise<Player | null>;
  findAll(): Promise<readonly Player[]>;
  findPaginated(
    filter: PlayerListFilter,
    sort: PlayerListSort,
    pagination: PaginationParams,
  ): Promise<PlayerPageResult>;
  count(): Promise<number>;
  countCreatedSince(since: Date): Promise<number>;
  save(player: Player): Promise<void>;
}

export const PLAYER_REPOSITORY = Symbol('PLAYER_REPOSITORY');
