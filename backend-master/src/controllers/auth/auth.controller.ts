import { UserService } from './../../services/user/user.service';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import {
  Controller,
  Body,
  Post,
  Get,
  Put,
  ValidationPipe,
  UseGuards,
  Query,
  Request,
  Headers,
} from '@nestjs/common';

import { ChangePasswordDto } from '../../models/auth/dto/change-password.dto';
import { CreateUserDto } from '../../models/user/dto/create-user.dto';
import { ReadUserDto } from '../../models/user/dto/read-user.dto';
import { AuthUserDto } from '../../models/auth/dto/auth-user.dto';
import { SignInDto } from '../../models/auth/dto/signin.dto';

import { AuthGuard } from '../../middlewares/auth/auth.guard';

import { VkontakteService } from '../../services/vkontakte/vkontakte.service';
import { AuthService } from '../../services/auth/auth.service';

@ApiTags('Auth: Authorization module')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly vkontakteService: VkontakteService,
    private readonly userService: UserService
  ) {}

  @Post('/signUp')
  @ApiResponse({
    status: 200,
    description: 'Get result create new user: true/error',
  })
  async signUp(
    @Body(new ValidationPipe()) createUser: CreateUserDto,
  ): Promise<boolean> {
    return this.authService.signUp(createUser);
  }

  @Get('/get-hash')
  async getHash() {
    return this.userService.hash('PaganiZonda837952')
  }

  @Post('/signIn')
  @ApiResponse({
    status: 200,
    description: 'Get user and token',
    type: AuthUserDto,
  })
  async signIn(
    @Body(new ValidationPipe()) signInDto: SignInDto,
  ): Promise<AuthUserDto> {
    return this.authService.signIn(signInDto);
  }

  @Post('/vk/sign')
  @ApiResponse({
    status: 200,
    description: 'Get user and token',
    type: AuthUserDto,
  })
  async signUpVk(
    @Query('code') code: string,
    @Headers('x-real-ip') ip: string,
  ): Promise<AuthUserDto> {
    const userModelVk = await this.vkontakteService.getUserModel(code);
    
    return await this.authService.authVk(userModelVk, ip);
  }

  @Get('/vk/url')
  @ApiResponse({
    status: 200,
    description: 'Get url for user auth after vkontakte',
  })
  async getVkAuthUrl(): Promise<any> {
    return {
      url: await this.vkontakteService.getUrl(),
    };
  }

  @UseGuards(new AuthGuard())
  @Get('/check-token')
  @ApiResponse({
    status: 200,
    description: 'Check token and get user',
    type: ReadUserDto,
  })
  checkToken(@Request() req: any): ReadUserDto {
    return req.user;
  }

  @Get('/confirm-email')
  @ApiResponse({
    description: 'Confirm email and get true/false',
  })
  async confirmEmail(
    @Query('hash') hash: string,
    @Query('id') id: string,
  ): Promise<any> {
    try {
      await this.authService.verifyEmail(hash, id);

      return true;
    } catch (e) {
      return {
        error: 'Error: ' + e.message
      }
    }
  }

  @UseGuards(new AuthGuard())
  @Put('/recovery')
  @ApiResponse({
    status: 200,
    description: 'Get boolean result recovery',
  })
  async recovery(
    @Body(new ValidationPipe()) recovery: ChangePasswordDto,
  ): Promise<boolean> {
    return this.authService.recovery(recovery);
  }

  @UseGuards(new AuthGuard())
  @Get('/logout')
  @ApiResponse({
    status: 200,
    description: 'Get bool value'
  })
  async logout(@Request() req: any): Promise<boolean> {
    return this.authService.logout(req.user);
  }
}
