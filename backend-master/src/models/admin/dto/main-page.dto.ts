import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { SeoDto } from './seo.dto';

class FullBlock {
  @IsString()
  @ApiProperty()
  public title: string;

  @IsString()
  @ApiProperty()
  public description: string;

  @IsString()
  @ApiProperty()
  public imgId: string;
}

export class MainPageDto {
  @ApiProperty()
  public seo: SeoDto;

  @ApiProperty()
  public full_block: FullBlock;
}