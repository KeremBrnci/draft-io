/** Flexible DTOs — supports gateway `/api/transfermarkt/*` and felipeall-style responses. */

export interface TransfermarktCountryDto {
  readonly id: string;
  readonly name: string;
}

export interface TransfermarktCompetitionDto {
  readonly id: string;
  readonly name: string;
  readonly slug?: string;
  readonly country?: string;
  readonly countryId?: string;
}

export interface TransfermarktClubSearchResultDto {
  readonly id: string;
  readonly name: string;
  readonly country?: string;
}

export interface TransfermarktCompetitionClubsDto {
  readonly id: string;
  readonly name?: string;
  readonly clubs?: readonly TransfermarktClubSearchResultDto[];
}

export interface TransfermarktClubProfileDto {
  readonly id: string;
  readonly name: string;
  readonly officialName?: string | null;
  readonly image?: string;
  readonly league?: {
    readonly id?: string | null;
    readonly name?: string | null;
    readonly countryId?: string | null;
    readonly countryName?: string | null;
  };
}

export interface TransfermarktClubPlayerDto {
  readonly id: string;
  readonly name: string;
  readonly position: string;
  readonly dateOfBirth?: string | null;
  readonly age?: number | null;
  readonly nationality?: readonly string[];
  readonly marketValue?: number | null;
  readonly status?: string | null;
  readonly image?: string | null;
  readonly imageUrl?: string | null;
}

export interface TransfermarktClubPlayersDto {
  readonly id: string;
  readonly players: readonly TransfermarktClubPlayerDto[];
}

export interface TransfermarktPlayerSearchResultDto {
  readonly id: string;
  readonly name: string;
  readonly position: string;
  readonly age?: number | null;
  readonly marketValue?: number | null;
  readonly club?: { readonly id: string; readonly name: string };
  readonly nationalities?: readonly string[];
}

export interface TransfermarktPlayerProfileDto {
  readonly id: string;
  readonly name: string;
  readonly fullName?: string | null;
  readonly imageUrl?: string | null;
  readonly age?: number | null;
  readonly citizenship?: readonly string[];
  readonly position?: { readonly main?: string | null; readonly other?: readonly string[] | null };
  readonly marketValue?: number | null;
  readonly club?: { readonly id?: string | null; readonly name?: string | null };
  readonly isRetired?: boolean;
}

export interface TransfermarktListResponse<T> {
  readonly results?: readonly T[];
  readonly data?: readonly T[];
  readonly countries?: readonly T[];
  readonly competitions?: readonly T[];
}
