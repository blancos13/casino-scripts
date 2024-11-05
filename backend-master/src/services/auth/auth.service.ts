import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { genSalt, hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';

import { randomString } from '../../helpers/randomString';

import { ChangePasswordDto } from '../../models/auth/dto/change-password.dto';
import { CreateUserDto } from '../../models/user/dto/create-user.dto';
import { AuthUserDto } from '../../models/auth/dto/auth-user.dto';
import { VkUserDto } from '../../models/user/dto/vk-user.dto';
import { SignInDto } from '../../models/auth/dto/signin.dto';

import { statusEnum } from '../../models/user/enums/status.enum';

import { configService } from '../../config/config.service';
import { MailerService } from '../mailer/mailer.service';
import { TokenService } from '../token/token.service';
import { UserService } from '../user/user.service';
import { SettingsService } from '../settings/settings.service';

import { ITokenPayload } from '../../models/token/interfaces/token-payload.interface';

import { MAIN_SITE_SETTINGS } from '../../constants/settings';

@Injectable()
export class AuthService {
  private readonly verifyEmailSalt = 5;
  private readonly findByLoginOrEmailSql = [
    `select * from public."user" where email = `,
    ` or username = `,
  ];
  private readonly registerCountFromIpSql = [
    'select count(id) from public."user" where ip = ',
    ' and date(registration_date) = current_date',
  ];

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailerService,
    private readonly settingsService: SettingsService,
    private readonly manager: EntityManager,
  ) {}

  async signUp(createUser: CreateUserDto): Promise<boolean> {
    const user = await this.userService.get({ email: createUser.email });

    if (user) {
      throw new HttpException('User is exist', HttpStatus.FORBIDDEN);
    }

    try {
      const randomCode = randomString(10);
      const user = await this.userService.create(createUser, randomCode);

      // const link = await this.generateVerifyEmailLink({
      //   randomCode: user.randomCode,
      //   id: user.id,
      // });
      // await this.sendConfirmation({ email: user.email, link });

      return true;
    } catch (e) {
      console.log('signUp e ', e);

      throw new HttpException(e.message, HttpStatus.FORBIDDEN);
    }
  }
  async signIn({ loginOrEmail, password }: SignInDto): Promise<AuthUserDto> {
    try {
      const query = `${this.findByLoginOrEmailSql[0]}'${loginOrEmail}'${this.findByLoginOrEmailSql[1]}'${loginOrEmail}'`
      let user = await this.manager.query(query);
  
      if (!user.length) {
        throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
      }
  
      user = user[0]
      const result = await compare(password, user.password_hash);
  
      if (!result) {
        throw new HttpException('Wrong password', HttpStatus.FORBIDDEN);
      }

      const token = await this.generateToken({
        id: user.id,
        status: user.status,
        role: user.role,
      });

      await this.tokenService.create({
        uId: user.id,
        content: token,
      });

      return {
        user: (await this.userService.get({ id: user.id })).getPublicFields(),
        token,
      };
    } catch (e) {
      console.log('error signIn ', e);
      
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async recovery({ email }: ChangePasswordDto): Promise<boolean> {
    const user = await this.userService.get({ email });

    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    }

    const password = randomString(20);

    try {
      await this.userService.update({ email, password }, true);
      const link = await this.generateVerifyEmailLink({
        randomCode: user.randomCode,
        id: user.id,
      });
      await this.sendConfirmation({ email: user.email, link });

      return true;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async verifyEmail(hash: string, id: string): Promise<any> {
    const user = await this.userService.get({ id });
    
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    
    const result = await compare(user.randomCode, hash);

    if (!result) {
      throw new HttpException('Hash is not compare', HttpStatus.FORBIDDEN);
    }

    user.randomCode = null;
    user.status = statusEnum.verified;
    await this.manager.save(user);

    return true;
  }
  async authVk(
    vkUser: VkUserDto,
    ip: string
  ): Promise<AuthUserDto> {
    try {
      if (!vkUser.email) {
        throw new HttpException("Email from vkontakte field is required", HttpStatus.NOT_FOUND);
      } 

      let user = await this.userService.get({ vkId: vkUser.id });

      if (!user) {
        // const countRegistration = +(await this.getCountRegisterFromId(ip));

        // if ((countRegistration) => 2) {
        //   console.log('countRegistration after ', countRegistration);
        //   throw new HttpException(
        //     'Error: Maximum 2 registrations per day from one ip',
        //     HttpStatus.FORBIDDEN,
        //   );
        // }

        const { photo_100, email, domain } = vkUser

        user = await this.userService.create({
          email,
          login: domain,
          photo: photo_100,
        });

        user.status = statusEnum.verified

        await this.manager.save(user)
      }

      const { id, status, role } = user;

      return {
        user: user.getPublicFields(),
        token: await this.generateToken({ id, status, role }),
      };
    } catch (e) {
      console.log('Error auth vk', e)
    }
  }
  public async logout(data: any): Promise<boolean> {
    const token = this.tokenService.get({ uId: data.id })

    if (!token) {
      throw new Error("Token not found");
    }

    await this.tokenService.delete(data.id)

    return true;
  }

  async checkToken(authString: string): Promise<any> {
      return verify(authString.split(' ')[1], configService.getConfigJwt().secret);
  }

  private async sendConfirmation(data: {
    email: string;
    link: string;
  }): Promise<boolean> {
    try {
      await this.mailService.send({
        email: data.email,
        link: data.link,
      });

      return true;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
  private async generateVerifyEmailLink(data: {
    randomCode: string;
    id: number;
  }): Promise<string> {
    const salt = await genSalt(this.verifyEmailSalt);
    const hashing = await hash(data.randomCode, salt);

    return `${await this.settingsService.get(
      MAIN_SITE_SETTINGS.BASE_URL,
    )}/api/auth/confirm-email?hash=${hashing}&id=${data.id}`;
  }
  private async generateToken(data: ITokenPayload): Promise<string> {
    return await sign(data, configService.getConfigJwt().secret);
  }
  private async getCountRegisterFromId(ip: string): Promise<number> {
    if (!ip) {
      return 0;
    }

    return await this.manager.query(
      `${this.registerCountFromIpSql[0]}${ip}${this.registerCountFromIpSql[1]}`,
    );
  }
}
