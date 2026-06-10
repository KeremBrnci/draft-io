import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';

import { OverallProfileTag } from '../../domain/enums/overall-profile-tag.enum';

export class UpsertPlayerMetricsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  careerScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  legacyScore?: number;

  @IsOptional()
  @IsEnum(OverallProfileTag)
  profileTag?: OverallProfileTag | null;
}
