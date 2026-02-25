import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  category: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsOptional()
  is_anonymous?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  contact_name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  contact_phone?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;
}
