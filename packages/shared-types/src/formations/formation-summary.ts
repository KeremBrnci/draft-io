export interface FormationSlotDto {
  readonly index: number;
  readonly label: string;
  readonly allowedPositions: readonly string[];
  readonly pitchX: number;
  readonly pitchY: number;
}

export interface FormationSummaryDto {
  readonly id: string;
  readonly code: string;
  readonly slots: readonly FormationSlotDto[];
}
