import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { configService } from '../../config/config.service';
import * as nodeMailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly transporter: any;

  constructor() {
    this.transporter = nodeMailer.createTransport({
      ...configService.getMailerConfig(),
    });
  }

  public async send({ email, link }): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: configService.getMailerConfig().auth.user,
        to: email,
        subject: 'Подтверждение почты',
        html:
          `<b>Подтвердите почту от Suicide!</b><br><a href="` +
          link +
          `" target="_blank">` +
          link +
          `</a>`,
      });

      return true;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
