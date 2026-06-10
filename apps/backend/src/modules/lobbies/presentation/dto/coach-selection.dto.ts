import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SelectCoachDto {
  @IsString()
  @IsNotEmpty()
  sessionToken!: string;

  @IsUUID()
  coachId!: string;
}

export class CoachSelectionQueryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sessionToken?: string;
}
