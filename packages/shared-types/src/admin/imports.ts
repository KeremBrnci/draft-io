export interface CountryImportDto {
  readonly externalId: string;
  readonly name: string;
  readonly imported: boolean;
}

export interface CompetitionSearchResultDto {
  readonly slug: string;
  readonly externalId: string;
  readonly name: string;
  readonly country: string | null;
}

export interface ClubSearchResultDto {
  readonly slug: string;
  readonly externalId: string;
  readonly name: string;
  readonly country: string | null;
}

export interface PlayerImportSearchResultDto {
  readonly slug: string;
  readonly externalId: string;
  readonly displayName: string;
  readonly nationality: string | null;
  readonly teamName: string | null;
}

export interface ImportedPlayerAdminDto {
  readonly id: string;
  readonly provider: string;
  readonly externalId: string;
  readonly displayName: string;
  readonly marketValue: number | null;
}

export interface ImportCountResultDto {
  readonly count: number;
}
