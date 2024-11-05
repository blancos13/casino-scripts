import { ApiProperty } from '@nestjs/swagger';

import { roleEnum } from '../enums/role.enum';
import { statusChatEnum } from '../enums/status-chat.enum';

export class MessageUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  login: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: roleEnum;

  @ApiProperty()
  statusChat: statusChatEnum;
}
