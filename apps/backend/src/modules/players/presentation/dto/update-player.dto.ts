import { ALL_PLAYER_POSITIONS } from '@draft-io/shared-types';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdatePlayerDto {
  @IsOptional()
  @IsString()
  @IsIn(ALL_PLAYER_POSITIONS)
  position?: string;
}
