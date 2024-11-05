import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class KeywordDto {
  @IsString()
  @ApiProperty()
  public key: string;

  @IsString()
  @ApiProperty()
  public content: string;
}

export class SeoDto {
  @IsString()
  @ApiProperty()
  public title: string;

  @IsString()
  @ApiProperty()
  public description: string;

  @IsString()
  @ApiProperty()
  public keywords: Array<KeywordDto>;
}