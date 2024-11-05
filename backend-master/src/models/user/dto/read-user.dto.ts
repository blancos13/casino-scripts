import { ApiProperty } from '@nestjs/swagger';

export class ReadUserDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  id: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  statusChat: number;

  @ApiProperty({ required: false })
  photo: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  status: number;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  registrationDate: Date;

  @ApiProperty()
  lastActivationPromocode: Date;

  @ApiProperty()
  lastActivationChest: Date;

  @ApiProperty()
  diamondBalance: number;
}
