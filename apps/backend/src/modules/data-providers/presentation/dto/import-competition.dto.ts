import { IsNotEmpty, IsString } from 'class-validator';

import { ProviderOnlyDto } from './provider-only.dto';

export class ImportCompetitionDto extends ProviderOnlyDto {
  @IsString()
  @IsNotEmpty()
  competitionExternalId!: string;
}
