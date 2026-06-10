import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const ISSUE_CODES = [
  'MISSING_MARKET_VALUE',
  'MISSING_POSITION',
  'MISSING_AGE',
  'MISSING_IMAGE',
  'MISSING_CLUB',
  'MISSING_COMPETITION',
  'DUPLICATE_PROVIDER_EXTERNAL_ID',
  'INVALID_MARKET_VALUE',
] as const;

export class ListDataQualityIssuesQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(ISSUE_CODES)
  issueCode?: (typeof ISSUE_CODES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
