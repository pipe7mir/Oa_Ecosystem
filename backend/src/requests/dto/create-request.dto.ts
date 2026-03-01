import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'La categoría es requerida' })
  @MaxLength(255)
  category: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  description: string;

  @IsBoolean()
  @IsOptional()
  is_anonymous?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  contact_name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @MinLength(7, { message: 'El teléfono no es válido' })
  contact_phone?: string;

  @IsEmail({}, { message: 'El email no es válido' })
  @IsOptional()
  @MaxLength(255)
  email?: string;
}
