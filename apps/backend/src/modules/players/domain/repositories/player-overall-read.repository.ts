export interface PlayerOverallReadRepository {
  /** Latest calculated overall per player id (from overall_calculations). */
  findLatestByPlayerIds(playerIds: readonly string[]): Promise<ReadonlyMap<string, number>>;
}

export const PLAYER_OVERALL_READ_REPOSITORY = Symbol('PLAYER_OVERALL_READ_REPOSITORY');
