import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SelectFormationDto {
  @IsString()
  @IsNotEmpty()
  sessionToken!: string;

  @IsUUID()
  formationId!: string;
}

export class FormationSelectionQueryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sessionToken?: string;
}
