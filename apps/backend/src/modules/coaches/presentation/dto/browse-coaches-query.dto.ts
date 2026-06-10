import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class BrowseCoachesQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;

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
  @Transform(({ value }) => parseOptionalBoolean(value))
  hasImage?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  hasAge?: boolean;

  @IsOptional()
  @IsIn(['name', 'age', 'appointedDate', 'createdAt', 'updatedAt'])
  sortField?: 'name' | 'age' | 'appointedDate' | 'createdAt' | 'updatedAt';

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
