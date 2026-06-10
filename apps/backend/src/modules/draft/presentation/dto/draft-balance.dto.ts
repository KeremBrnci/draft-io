import { IsArray, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class InitializeDraftSessionDto {
  @IsUUID()
  lobbyId!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  participantIds!: string[];
}

export class GeneratePickOptionsDto {
  @IsUUID()
  participantId!: string;

  @IsString()
  positionCode!: string;
}

export class ApplyDraftPickDto {
  @IsUUID()
  participantId!: string;

  @IsUUID()
  cardId!: string;

  @IsString()
  positionCode!: string;
}

export class CalculateTeamStrengthDto {
  @IsArray()
  @IsUUID('4', { each: true })
  cardIds!: string[];
}

export class SimulateDraftFairnessDto {
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(8)
  participantCount?: number;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(10000)
  runCount?: number;

  @IsOptional()
  @IsInt()
  seed?: number;
}
