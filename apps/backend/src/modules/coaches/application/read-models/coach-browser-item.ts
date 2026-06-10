export interface CoachBrowserItem {
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
