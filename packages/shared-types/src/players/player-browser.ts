import type { PlayerPositionAssignmentDto } from './player-position-assignment.js';
import type { PlayerPosition } from './player-position.js';
import type { PlayerStatus } from './player-status.js';

export type PlayerSortFieldDto = 'name' | 'age' | 'marketValue' | 'createdAt' | 'updatedAt';
export type SortDirectionDto = 'asc' | 'desc';

/** Player list row with resolved club and competition labels for admin browsing. */
export interface BrowsePlayersFilterDto {
  readonly name?: string;
  /** Any assigned position (primary or secondary). */
  readonly position?: PlayerPosition;
  /** Primary position only. */
  readonly primaryPosition?: PlayerPosition;
  /** Secondary position only. */
  readonly secondaryPosition?: PlayerPosition;
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

export interface PlayerBrowserItemDto {
  readonly id: string;
  readonly displayName: string;
  readonly imageUrl: string | null;
  readonly positions: readonly PlayerPositionAssignmentDto[];
  readonly position: PlayerPosition;
  readonly secondaryPositions: readonly PlayerPosition[];
  readonly nationality: string;
  readonly nationalityFlagUrl: string | null;
  readonly age: number | null;
  readonly marketValue: number | null;
  readonly teamId: string | null;
  readonly teamName: string | null;
  readonly teamLogoUrl: string | null;
  readonly leagueId: string | null;
  readonly leagueName: string | null;
  readonly leagueLogoUrl: string | null;
  /** Latest engine-calculated overall (null until a calculation exists). */
  readonly overall: number | null;
  readonly status: PlayerStatus;
}
