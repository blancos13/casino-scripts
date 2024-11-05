import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ValidationPipe,
  Controller,
  UseGuards,
  Delete,
  Param,
  Post,
  Body,
  Get,
  Req,
} from '@nestjs/common';

import { CreateMessageDto } from '../../models/message/dto/create-message.dto';
import { MessageDto } from '../../models/message/dto/message.dto';

import { AdminGuard } from '../../middlewares/admin/admin.guard';
import { AuthGuard } from '../../middlewares/auth/auth.guard';

import { ChatService } from '../../services/chat/chat.service';

@ApiTags('Chat: Chat module')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(new AuthGuard())
  @Post('/')
  async createMessage(
    @Req() req: any,
    @Body(new ValidationPipe()) payload: CreateMessageDto,
  ): Promise<boolean> {
    return await this.chatService.create({
      userId: req.user.id,
      content: payload.content,
    });
  }

  @Get('/')
  @ApiResponse({ status: 200, type: [MessageDto] })
  async getMessages(): Promise<Array<MessageDto>> {
    return await this.chatService.get();
  }
  
  @UseGuards(new AdminGuard())
  @Delete('/:id')
  async deleteMessage(@Param('id') id: number): Promise<number> {
    return await this.chatService.delete(id);
  }
}
