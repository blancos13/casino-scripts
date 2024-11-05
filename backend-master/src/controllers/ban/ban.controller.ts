import { AdminGuard } from './../../middlewares/admin/admin.guard';
import { Controller, Get, Post, Body, Req,  UseGuards } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { ChatBanList } from './../../models/user/user-chat-ban-list.entity';

import { UserService } from './../../services/user/user.service';

@UseGuards(new AdminGuard())
@Controller('ban')
export class BanController {
  constructor(
    private readonly userService: UserService,
    private readonly manager: EntityManager
  ) {}

  @Post()
  async create(
    @Req() req: any,
    @Body() body: any
  ): Promise<any> {

  }
}
