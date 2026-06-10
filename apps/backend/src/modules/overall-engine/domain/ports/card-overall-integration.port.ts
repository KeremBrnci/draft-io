/**
 * Integration contract for pushing calculated overall values onto base cards.
 * Implementation lives in the cards module — not wired in V1 sprint.
 */
export interface CardOverallIntegrationPort {
  /**
   * Applies a calculated overall to active base cards for a player.
   * Must respect MANUAL_OVERRIDE — skipped cards are not updated.
   */
  applyCalculatedOverallToBaseCards(playerId: string, overall: number): Promise<{
    readonly updatedCardCount: number;
    readonly skippedManualOverrideCount: number;
  }>;
}

export const CARD_OVERALL_INTEGRATION = Symbol('CARD_OVERALL_INTEGRATION');
