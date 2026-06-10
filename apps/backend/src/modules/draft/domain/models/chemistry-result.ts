export interface ChemistryBreakdown {
  readonly club: number;
  readonly nation: number;
  readonly league: number;
}

export interface PlayerChemistry {
  readonly cardId: string;
  readonly chemistry: number;
  readonly sources: readonly ('club' | 'nation' | 'league')[];
}

export interface TeamChemistryResult {
  readonly teamChemistry: number;
  readonly breakdown: ChemistryBreakdown;
  readonly players: readonly PlayerChemistry[];
}

export interface PlayerIdentityLink {
  readonly cardId: string;
  readonly teamId: string | null;
  readonly leagueId: string | null;
  readonly nationality: string;
}
