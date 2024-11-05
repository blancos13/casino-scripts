import { ApiProperty } from '@nestjs/swagger';

export class SetItemDto {
  @ApiProperty({ required: false })
  public value?: string;

  @ApiProperty({ required: false })
  public fid?: string;
}

export class SetSettingDto {
  @ApiProperty({ required: false })
  public key?: string;

  @ApiProperty({ required: false })
  public value?: string;

  @ApiProperty({ required: false })
  public fid?: string;
}
