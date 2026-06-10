import { IsIn, IsOptional, IsString } from 'class-validator';

import { ALL_PLAYER_POSITIONS } from '@draft-io/shared-types';

export class UpdatePlayerDto {
  @IsOptional()
  @IsString()
  @IsIn(ALL_PLAYER_POSITIONS)
  position?: string;
}
