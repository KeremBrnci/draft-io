export interface DraftPoolPosition {
  readonly positionCode: string;
  readonly isPrimary: boolean;
  readonly sortOrder: number;
}

export interface DraftPoolCard {
  readonly cardId: string;
  readonly playerId: string;
  readonly displayName: string;
  readonly overall: number;
  readonly cardTypeCode: string;
  readonly cardRarityCode: string;
  readonly positions: readonly DraftPoolPosition[];
  readonly teamId: string | null;
  readonly leagueId: string | null;
  readonly nationality: string;
  readonly imageUrl: string | null;
  readonly nationalityFlagUrl: string | null;
  readonly teamName: string | null;
  readonly teamLogoUrl: string | null;
  readonly leagueName: string | null;
  readonly leagueLogoUrl: string | null;
}

export interface DraftPoolQuery {
  readonly positionCode: string;
  readonly positionCodes?: readonly string[];
  readonly excludeCardIds?: readonly string[];
  readonly excludePlayerIds?: readonly string[];
  readonly minOverall?: number;
  readonly maxOverall?: number;
  readonly leagueIds?: readonly string[];
  readonly limit?: number;
}
