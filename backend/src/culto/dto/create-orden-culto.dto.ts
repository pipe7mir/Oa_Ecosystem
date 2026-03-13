import { IsString, IsNotEmpty, IsOptional, IsInt, Matches, IsBoolean } from 'class-validator';

export class CreateOrdenCultoDto {
  @IsString()
  @IsNotEmpty()
  actividad: string;

  @IsString()
  @IsNotEmpty()
  responsable: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, { message: 'Hora must be in HH:mm format' })
  hora: string;

  @IsString()
  @IsOptional()
  fecha?: string;

  @IsInt()
  @IsOptional()
  duracionEstimada?: number;

  @IsInt()
  @IsOptional()
  cantidadPersonas?: number;

  @IsString()
  @IsOptional()
  participantes?: string;

  @IsBoolean()
  @IsOptional()
  esGrupoEspecial?: boolean;

  @IsBoolean()
  @IsOptional()
  necesitaPianista?: boolean;

  @IsBoolean()
  @IsOptional()
  completado?: boolean;
}
