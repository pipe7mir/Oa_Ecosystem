import { IsOptional, IsString } from 'class-validator';

export class AdminNotesDto {
  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  response?: string;
}
