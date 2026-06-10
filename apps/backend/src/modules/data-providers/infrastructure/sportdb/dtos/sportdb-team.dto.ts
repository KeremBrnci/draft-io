export interface SportDbTeamDto {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly shortName: string | null;
  readonly country: string | null;
  readonly logoUrl: string | null;
}
