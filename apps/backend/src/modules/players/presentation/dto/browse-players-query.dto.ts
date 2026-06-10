import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class BrowsePlayersQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  primaryPosition?: string;

  @IsOptional()
  @IsString()
  secondaryPosition?: string;

  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  hasMultiplePositions?: boolean;

  @IsOptional()
  @IsUUID()
  teamId?: string;

  @IsOptional()
  @IsUUID()
  leagueId?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(50)
  minAge?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(50)
  maxAge?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minMarketValue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxMarketValue?: number;

  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  hasImage?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  hasMarketValue?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  hasPosition?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  hasAge?: boolean;

  @IsOptional()
  @IsIn(['name', 'age', 'marketValue', 'createdAt', 'updatedAt'])
  sortField?: 'name' | 'age' | 'marketValue' | 'createdAt' | 'updatedAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc';

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

function parseOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  return undefined;
}
