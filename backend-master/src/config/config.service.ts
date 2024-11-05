import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { I18nJsonParser, I18nOptions } from 'nestjs-i18n';
import { join } from 'path';

// import * as requireContext from 'node-require-context';

require('dotenv').config();

export class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  public isDevelopment(): boolean {
    return this.env['MODE'] === 'DEV';
  }

  public getPort(): number {
    return parseInt(this.env['PORT']);
  }

  public getConfigI18n(): I18nOptions {
    return {
      fallbackLanguage: 'ru',
      parser: I18nJsonParser,
      parserOptions: {
        path: join(__dirname, '../..', 'src/constants/i18n/'),
      },
    };
  }

  public getConfigJwt() {
    return {
      secret: this.env['JWT_SECRET'],
    };
  }

  public getExpireAtToken(): number {
    const expireAt = parseInt(this.env['EXPIRE_AT_TOKEN_DAYS']) || 2;
    return 60 * 60 * 24 * expireAt;
  }

  public getVkAuthConfig(): any {
    return {
      clientId: this.env['AUTH_VK.VK_AUTH_CLIENT_ID'],
      clientSecret: this.env['AUTH_VK.VK_AUTH_CLIENT_SECRET'],
      groupSecret: this.env['AUTH_VK.VK_GROUP_SECRET'],
      groupId: this.env['AUTH_VK.VK_GROUP_ID'],
      clientService: this.env['AUTH_VK.VK_SERVICE_KEY'],
    };
  }

  public getPiastrix(): any {
    return {
      secret: this.env['PIASTRIX.SECRET'],
      shopId: this.env['PIASTRIX.SHOP_ID']
    }
  }

  public getPayeerConfig(): any {
    return {
      secret: this.env['PAYEER.SECRET'],
      shopId: this.env['PAYEER.SHOP_ID'],
      account: this.env['PAYEER.ACCOUNT'],
      apiId: this.env['PAYEER.API_ID'],
    }
  }

  public getFreeKassaConfig(): any{
    return {
      secret1: this.env['FREEKASSA.SECRET1'],
      secret2: this.env['FREEKASSA.SECRET2'],
      shopId: this.env['FREEKASSA.SHOP_ID'],
    };
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.env['db.host'],
      port: parseInt(this.env['db.port']),
      username: this.env['db.username'],
      password: this.env['db.password'],
      database: this.env['db.database'],
      synchronize: true,
      maxQueryExecutionTime: 20000,
      entities: [join(__dirname, '../..', 'dist/**/*.entity.js')],
      ssl: !this.isDevelopment(),
    };
  }

  public getUnitPayConfig() {
    return {
      secret: this.env['UNITPAY.SECRET'],
      shopId: this.env['UNITPAY.SHOP_ID'],
      login: this.env['UNITPAY.LOGIN'],
    };
  }

  public getPayPalConfig() {
    return {
      secret: 'secret',
    };
  }

  public getMailerConfig(): any {
    return {
      host: this.env['MAILER.HOST'],
      port: parseInt(this.env['MAILER.PORT']),
      secure: true,
      auth: {
        user: this.env['MAILER.AUTH.USER'],
        pass: this.env['MAILER.AUTH.PASS'],
      },
    };
  }
}

export const configService = new ConfigService(process.env);
