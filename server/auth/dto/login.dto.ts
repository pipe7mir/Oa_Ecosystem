import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string; // can be email or username

  @IsString()
  @IsNotEmpty()
  password: string;
}
