import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class DraftBoardQueryDto {
  @IsString()
  @IsNotEmpty()
  sessionToken!: string;
}

export class DraftPickOptionsQueryDto extends DraftBoardQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(11)
  slotIndex!: number;
}

export class ApplyLobbyDraftPickDto {
  @IsString()
  @IsNotEmpty()
  sessionToken!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(11)
  slotIndex!: number;

  @IsUUID()
  cardId!: string;
}
