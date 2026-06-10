import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { ALL_PLAYER_POSITIONS } from '@draft-io/shared-types';

export class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsIn(ALL_PLAYER_POSITIONS)
  position!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  nationality?: string;
}
