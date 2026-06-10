import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { ALL_EXTERNAL_PROVIDERS } from '../../../../core/external-reference/external-provider';

export class SyncMissingSquadPlayersDto {
  @IsString()
  @IsIn(ALL_EXTERNAL_PROVIDERS)
  provider!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  clubExternalId?: string;
}
