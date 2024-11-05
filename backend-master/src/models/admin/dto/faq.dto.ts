import { ApiProperty } from "@nestjs/swagger";

import { SeoDto } from './seo.dto';

export class FaqDto {
   @ApiProperty()
   public seo: SeoDto;

   @ApiProperty()
   public content: any
}