import { ApiProperty } from '@nestjs/swagger';

import { MessageUserDto } from '../../user/dto/message-user.dto';

export class MessageDto {
  @ApiProperty()
  user: MessageUserDto;

  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;
}
