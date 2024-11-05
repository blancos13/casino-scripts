import { verify } from 'jsonwebtoken';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { configService } from '../../../config/config.service';

@Injectable()
export class UserDecorator implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      return true;
    }

    try {
      const token = request.headers.authorization.split(' ')[1]

      request.token = request.headers.authorization;
      request.user = await verify(token, configService.getConfigJwt().secret);

      return true;
    } catch (e) {
      console.log('User is not transfered');
      return true;
    }
  }
}
