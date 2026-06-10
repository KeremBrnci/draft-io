import { IsString, MaxLength, MinLength } from 'class-validator';

export class JoinLobbyDto {
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(40)
  displayName!: string;
}
