import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { ALL_EXTERNAL_PROVIDERS } from '../../../../core/external-reference/external-provider';

export class CountryExternalIdDto {
  @IsString()
  @IsIn(ALL_EXTERNAL_PROVIDERS)
  provider!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  countryExternalId!: string;
}
