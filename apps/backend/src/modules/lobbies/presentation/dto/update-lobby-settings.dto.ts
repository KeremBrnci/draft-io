import { IsArray, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateLobbySettingsDto {
  @IsString()
  @MinLength(16)
  sessionToken!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  draftLeagueIds!: string[];
}
