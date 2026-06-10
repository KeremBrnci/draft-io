export enum CardOverallSource {
  CALCULATED = 'CALCULATED',
  MANUAL_OVERRIDE = 'MANUAL_OVERRIDE',
}

export const ALL_CARD_OVERALL_SOURCES: readonly CardOverallSource[] = [
  CardOverallSource.CALCULATED,
  CardOverallSource.MANUAL_OVERRIDE,
] as const;
