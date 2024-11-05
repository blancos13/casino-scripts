import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly loginOrEmail: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly password: string;
}
