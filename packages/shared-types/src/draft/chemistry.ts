export interface ChemistryBreakdownDto {
  readonly club: number;
  readonly nation: number;
  readonly league: number;
}

export interface PlayerChemistryDto {
  readonly cardId: string;
  readonly chemistry: number;
  readonly sources: readonly ('club' | 'nation' | 'league')[];
}

export interface TeamChemistryResultDto {
  readonly teamChemistry: number;
  readonly breakdown: ChemistryBreakdownDto;
  readonly players: readonly PlayerChemistryDto[];
}
