import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendTestDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  message: string;
}
