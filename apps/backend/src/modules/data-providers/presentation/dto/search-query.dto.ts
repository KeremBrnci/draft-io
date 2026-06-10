import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  query!: string;
}
