import { IsArray, IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class RecalculateOverallDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  playerIds?: string[];

  @IsOptional()
  @IsUUID('4')
  leagueId?: string;

  @IsOptional()
  @IsString()
  algorithmVersion?: string;

  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
