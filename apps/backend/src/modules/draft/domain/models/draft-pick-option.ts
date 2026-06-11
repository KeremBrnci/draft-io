import type { DraftPoolCard } from './draft-pool-card';

export type DraftPickOptionKind = 'STRONG' | 'MEDIUM' | 'RISKY' | 'CHEMISTRY' | 'WILDCARD';

export interface DraftPickOption {
  readonly cardId: string;
  readonly playerId: string;
  readonly displayName: string;
  readonly overall: number;
  readonly tierCode: string;
  readonly cardTypeCode: string;
  readonly cardRarityCode: string;
  readonly kind: DraftPickOptionKind;
  readonly pickCost: number;
  readonly projectedChemistry: number;
  readonly positionWeight: number;
  readonly isWildcard: boolean;
}

export interface DraftPickOptionsResult {
  readonly positionCode: string;
  readonly participantId: string;
  readonly options: readonly DraftPickOption[];
  readonly optionCards: readonly DraftPoolCard[];
  readonly remainingBudget: number;
  readonly picksRemaining: number;
}
