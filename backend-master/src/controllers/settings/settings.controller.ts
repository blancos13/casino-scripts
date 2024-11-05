import { Body, Controller, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UserService } from '../../services/user/user.service';

import { AuthGuard } from '../../middlewares/auth/auth.guard';

@ApiTags('Settings: Change user settings')
@Controller('settings')
@UseGuards(new AuthGuard())
export class SettingsController {
  constructor(private readonly userService: UserService) {}

  @Put('/')
  async changeUser(@Req() req: any, @Body() body: any): Promise<boolean> {
    return this.userService.update(
      { ...body, id: req.user.id },
      Object.keys(body)[0] === 'password',
    );
  }
}
