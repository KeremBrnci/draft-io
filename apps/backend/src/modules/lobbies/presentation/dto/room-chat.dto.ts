import { IsString, MaxLength, MinLength } from 'class-validator';

export class RoomChatQueryDto {
  @IsString()
  sessionToken!: string;
}

export class SendRoomChatMessageDto {
  @IsString()
  sessionToken!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(280)
  body!: string;
}
