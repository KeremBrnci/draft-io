export interface SportDbSearchTeamRefDto {
  readonly name?: string;
}

export interface SportDbSearchItemDto {
  readonly id: string;
  readonly slug?: string;
  readonly name?: string;
  readonly title?: string;
  readonly country?: string;
  readonly nationality?: string;
  readonly team?: SportDbSearchTeamRefDto;
}

export interface SportDbSearchResponseDto {
  readonly results?: readonly SportDbSearchItemDto[];
  readonly data?: readonly SportDbSearchItemDto[];
}
