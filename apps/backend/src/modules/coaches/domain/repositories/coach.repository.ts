import type { PaginationParams } from '@draft-io/shared-types';

import type { ExternalProvider } from '../../../../core/external-reference/external-provider';
import type { Coach } from '../entities/coach.entity';
import type { CoachId } from '../value-objects/coach-id.vo';

export type CoachSortField = 'name' | 'age' | 'appointedDate' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export interface CoachListFilter {
  readonly name?: string;
  readonly role?: string;
  readonly teamId?: string;
  readonly leagueId?: string;
  readonly leagueIds?: readonly string[];
  readonly nationality?: string;
  readonly hasImage?: boolean;
  readonly hasAge?: boolean;
}

export interface CoachListSort {
  readonly field: CoachSortField;
  readonly direction: SortDirection;
}

export interface CoachPageResult {
  readonly items: readonly Coach[];
  readonly totalItems: number;
}

export interface CoachRepository {
  findById(id: CoachId): Promise<Coach | null>;
  findByExternalReference(provider: ExternalProvider, externalId: string): Promise<Coach | null>;
  findPaginated(
    filter: CoachListFilter,
    sort: CoachListSort,
    pagination: PaginationParams,
  ): Promise<CoachPageResult>;
  save(coach: Coach): Promise<void>;
}

export const COACH_REPOSITORY = Symbol('COACH_REPOSITORY');
