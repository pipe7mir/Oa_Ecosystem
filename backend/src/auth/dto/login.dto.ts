import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'El usuario o email es requerido' })
  @MinLength(3, { message: 'El usuario debe tener al menos 3 caracteres' })
  username: string; // can be email or username

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
