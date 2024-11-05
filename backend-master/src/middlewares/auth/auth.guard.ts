import { verify } from 'jsonwebtoken';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  HttpStatus,
} from '@nestjs/common';

import { configService } from '../../config/config.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private skipUser: boolean = false) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest();

    if (!this.skipUser && !request.headers.authorization) {
      return false;
    }

    request.token = request.headers.authorization;
    request.user = await this.validationRequest(
      request.headers.authorization,
      this.skipUser,
    );

    // Don't forget check date

    return request;
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
