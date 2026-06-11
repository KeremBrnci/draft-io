import type { DraftCardFaceDto } from './draft-board.js';

export type DraftPickOptionKindDto = 'STRONG' | 'MEDIUM' | 'RISKY' | 'CHEMISTRY' | 'WILDCARD';

export interface DraftPickOptionDto {
  readonly cardId: string;
  readonly playerId: string;
  readonly displayName: string;
  readonly overall: number;
  readonly tierCode: string;
  readonly cardTypeCode: string;
  readonly cardRarityCode: string;
  readonly kind: DraftPickOptionKindDto;
  readonly projectedChemistry: number;
  readonly positionWeight: number;
  readonly isWildcard: boolean;
  readonly face: DraftCardFaceDto;
}

export interface DraftPickOptionsDto {
  readonly positionCode: string;
  readonly participantId: string;
  readonly options: readonly DraftPickOptionDto[];
  readonly picksRemaining: number;
}
