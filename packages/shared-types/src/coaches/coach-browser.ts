export type CoachSortFieldDto = 'name' | 'age' | 'appointedDate' | 'createdAt' | 'updatedAt';

export interface BrowseCoachesFilterDto {
  readonly name?: string;
  readonly role?: string;
  readonly teamId?: string;
  readonly leagueId?: string;
  readonly nationality?: string;
  readonly hasImage?: boolean;
  readonly hasAge?: boolean;
}

export interface CoachBrowserItemDto {
  readonly id: string;
  readonly displayName: string;
  readonly imageUrl: string | null;
  readonly role: string;
  readonly nationality: string;
  readonly nationalityFlagUrl: string | null;
  readonly age: number | null;
  readonly appointedDate: string | null;
  readonly contractExpires: string | null;
  readonly teamId: string | null;
  readonly teamName: string | null;
  readonly teamLogoUrl: string | null;
  readonly leagueId: string | null;
  readonly leagueName: string | null;
  readonly leagueLogoUrl: string | null;
}
