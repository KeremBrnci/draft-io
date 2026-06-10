import type { OverallSource } from '../players/overall-source.js';

/** Playable game asset — type/rarity resolved via reference data codes. */
export interface CardSummary {
  readonly id: string;
  readonly playerId: string;
  readonly cardTypeId: string;
  readonly cardTypeCode: string;
  readonly cardRarityId: string;
  readonly cardRarityCode: string;
  readonly cardTemplateId: string;
  readonly cardTemplateName: string;
  readonly overall: number;
  readonly overallSource: OverallSource;
  readonly cardVersion: string;
  readonly releaseDate: string | null;
  readonly isActive: boolean;
}
