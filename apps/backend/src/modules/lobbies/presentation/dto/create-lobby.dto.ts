import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateLobbyDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(40)
  displayName!: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(12)
  maxPlayers?: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  draftLeagueIds?: string[];
}
