import { IsBoolean, IsString } from 'class-validator';

export class SetParticipantReadyDto {
  @IsString()
  sessionToken!: string;

  @IsBoolean()
  isReady!: boolean;
}

export class StartLobbyDto {
  @IsString()
  sessionToken!: string;
}
