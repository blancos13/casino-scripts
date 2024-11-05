import { Controller, UseGuards, Put, Req, Body, HttpException, HttpStatus } from '@nestjs/common';

import { UserService } from '../../services/user/user.service'

import { AuthGuard } from '../../middlewares/auth/auth.guard'

@Controller('user')
@UseGuards(new AuthGuard())
export class UserController {
  constructor(
    private readonly userService: UserService
  ) {}

  @Put()
  async updateUser(
    @Req() req: any,
    @Body() { id, ...body }: any
  ): Promise<boolean> {
    const keys = Object.keys(body)
    return await this.userService.update({ id: id || req.user.id, ...body }, keys[0] === 'password')
  }
}
