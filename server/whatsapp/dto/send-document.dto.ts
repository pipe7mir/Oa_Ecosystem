import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class SendDocumentDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsUrl()
  @IsNotEmpty()
  file_url: string;

  @IsString()
  @IsOptional()
  @MaxLength(1024)
  caption?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  file_name?: string;
}
