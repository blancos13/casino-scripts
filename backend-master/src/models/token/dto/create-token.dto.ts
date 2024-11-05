import { IsString } from 'class-validator';

export class CreateTokenDto {
  @IsString()
  content: string;

  @IsString()
  uId: string;
}
