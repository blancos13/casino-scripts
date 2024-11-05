import { UnitpayIncome } from './../../models/payment/unitpay.entity';
import { BASE_URL, PAYMENT } from './../../constants/settings';
import { configService } from './../../config/config.service';
import { SettingsService } from './../settings/settings.service';
import { MoneyIncome } from 'src/models/payment/income.entity';
import { MoneyOutcome } from 'src/models/payment/outcome.entity';
import { PaymentSystemService } from './PaymentSystemService';
import { PaymentDirection, PaymentDirectionDetails, PaymentFormView } from './PaymentService';
import { HttpService, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { EntityManager } from 'typeorm';

@Injectable()
export class UnitpayService implements PaymentSystemService {
  private paywayMap: Map<PaymentDirection, string> = new Map<PaymentDirection, string>();

  private secret: string;
  private shopId: string;
  private login: string;

  constructor(
    private httpService: HttpService,
    private keyValueService: SettingsService,
  ) {
    this.secret = configService.getUnitPayConfig().secret;
    this.shopId = configService.getUnitPayConfig().shopId;
    this.login = configService.getUnitPayConfig().login;

    this.paywayMap.set(PaymentDirection.QIWI, 'qiwi');
    this.paywayMap.set(PaymentDirection.YANDEX_MONEY, 'yandex');
    this.paywayMap.set(PaymentDirection.VISA_RU, 'card');
    this.paywayMap.set(PaymentDirection.VISA_UA, 'card');
    this.paywayMap.set(PaymentDirection.WEBMONEY, 'webmoney');
    this.paywayMap.set(PaymentDirection.BEELINE, 'mc');
    this.paywayMap.set(PaymentDirection.MEGAFON, 'mc');
    this.paywayMap.set(PaymentDirection.TELE2, 'mc');
    this.paywayMap.set(PaymentDirection.MTS, 'mc');
  }

  private getWebsiteUrl(): Promise<string> {
    return this.keyValueService.get(BASE_URL);
  }

  private getOperator(direction: PaymentDirection): string {
    if (!this.isPhone(direction)) {
      return null;
    }
    switch (direction) {
      case PaymentDirection.BEELINE:
        return 'beeline';
      case PaymentDirection.MEGAFON:
        return 'mf';
      case PaymentDirection.TELE2:
        return 'tele2';
      case PaymentDirection.MTS:
        return 'mts';
      default:
        return null;
    }
  }

  private isPhone(direction: PaymentDirection): boolean {
    return [PaymentDirection.BEELINE, PaymentDirection.MEGAFON, PaymentDirection.TELE2, PaymentDirection.MTS].includes(direction);
  }


  private sign(account: string, currency: string, description: string, sum: number): string {
    const str = [account, currency, description, sum, this.secret].join('{up}');
    return crypto.createHash('sha256').update(str).digest('hex');
  }


  public async getIncomeUrl(moneyIncome: MoneyIncome, ip: string,userParams: any, manager: EntityManager): Promise<PaymentFormView> {
    const description = 'Пополнение баланса';
    const params = {
      method: 'initPayment',
      paymentType: this.paywayMap.get(moneyIncome.direction),
      account: moneyIncome.user.id.toString(),
      sum: moneyIncome.sum + moneyIncome.commission,
      projectId: this.shopId,
      desc: description,
      ip: ip,
      secretKey: this.secret,
      signature: null,
      currency: 'RUB',
    };

    params.signature = this.sign(params.account, params.currency, description, params.sum);

    const response = (await this.httpService.get(`https://unitpay.ru/api?${Object.keys(params).map(key => key + '=' + params[key]).join('&')}`).toPromise()).data;
    if (response.error) {
      const message = response.error.message;
      throw new Error(message);
    }

    const unitpayIncome = new UnitpayIncome();
    unitpayIncome.id = response.result.paymentId;
    unitpayIncome.income = moneyIncome;
    await manager.save(unitpayIncome);

    return new PaymentFormView(
      response.result.redirectUrl,
      'GET',
      {},
    );
  }

  async transferMoney(moneyOutcome: MoneyOutcome): Promise<void> {
    const params = {
      method: 'massPayment',
      sum: moneyOutcome.sum - moneyOutcome.startBalance - moneyOutcome.commission,
      purse: moneyOutcome.params.account,
      login: this.login,
      transactionId: moneyOutcome.id,
      paymentType: this.paywayMap.get(moneyOutcome.direction),
      projectId: this.shopId,
      secretKey: this.secret
    };

    const response = (await this.httpService.get(`https://unitpay.ru/api?${Object.keys(params).map(key => key + '=' + params[key]).join('&')}`).toPromise()).data;
    if (response.error) {
      const message = response.error.message;
      throw new Error(message);
    }
  }

  getIncomePaymentDirections(): Promise<PaymentDirectionDetails[]> {
    return Promise.resolve([]);
  }

  getOutcomePaymentDirections(): Promise<PaymentDirectionDetails[]> {
    return Promise.resolve([]);
  }

}