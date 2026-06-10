import { IsIn, IsString } from 'class-validator';

import { ALL_EXTERNAL_PROVIDERS } from '../../../../core/external-reference/external-provider';

export class ProviderOnlyDto {
  @IsString()
  @IsIn(ALL_EXTERNAL_PROVIDERS)
  provider!: string;
}
