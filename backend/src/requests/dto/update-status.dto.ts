import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsIn(['pendiente', 'gestionada', 'sin_respuesta'])
  status: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
