import { verify } from 'jsonwebtoken';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { configService } from '../../config/config.service';

import { roleEnum } from '../../models/user/enums/role.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private skipUser: boolean = false) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();

    // if (!this.skipUser && !request.headers.authorization) {
    //   return false;
    // }

    // request.token = request.headers.authorization;
    // request.user = await this.validationRequest(
    //   request.headers.authorization,
    //   this.skipUser,
    // );

    // if (
    //   request.user.role === roleEnum.user
    // ) {
    //   throw new HttpException(
    //     'Access denied. Admin or moderator rights required',
    //     HttpStatus.FORBIDDEN,
    //   );
    // }

    // Don't forget check date

    return true;
  }

  async validationRequest(authString: string, skip: boolean) {
    try {
      if (authString.split(' ')[0] !== 'Bearer') {
        throw new HttpException('Invalid token', HttpStatus.FORBIDDEN);
      }

      const token = authString.split(' ')[1];

      return verify(token, configService.getConfigJwt().secret);
    } catch (e) {
      const message = 'Token error: ' + (e.message || e.name);

      if (skip) {
        return null;
      }

      throw new HttpException(message, HttpStatus.FORBIDDEN);
    }
  }
}
