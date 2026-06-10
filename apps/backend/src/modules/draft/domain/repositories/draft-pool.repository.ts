import type { DraftPoolCard, DraftPoolQuery } from '../models/draft-pool-card';

export interface DraftPoolRepository {
  findEligibleCards(query: DraftPoolQuery): Promise<readonly DraftPoolCard[]>;
  findByIds(cardIds: readonly string[]): Promise<readonly DraftPoolCard[]>;
}

export const DRAFT_POOL_REPOSITORY = Symbol('DRAFT_POOL_REPOSITORY');
