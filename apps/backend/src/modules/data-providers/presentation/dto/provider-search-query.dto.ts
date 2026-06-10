import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { ALL_EXTERNAL_PROVIDERS } from '../../../../core/external-reference/external-provider';

export class ProviderSearchQueryDto {
  @IsString()
  @IsIn(ALL_EXTERNAL_PROVIDERS)
  provider!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  query!: string;
}
