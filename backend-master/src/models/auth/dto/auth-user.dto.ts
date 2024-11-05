import { ApiProperty } from '@nestjs/swagger';

import { ReadUserDto } from '../../user/dto/read-user.dto';

export class AuthUserDto {
  @ApiProperty()
  user: ReadUserDto;

  @ApiProperty()
  token: string;
}
