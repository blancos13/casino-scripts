import { PAYMENT } from './../../constants/settings';
import { MoneyIncome } from 'src/models/payment/income.entity';
import { MoneyOutcome } from 'src/models/payment/outcome.entity';
import { SettingsService } from './../settings/settings.service';
import { configService } from './../../config/config.service';
import { PaymentSystemService } from './PaymentSystemService';
import {
  PaymentDirection,
  PaymentDirectionDetails,
  PaymentDirectionRestriction,
  PaymentFormView,
} from './PaymentService';
import { EntityManager } from 'typeorm';
import { HttpService, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PayeerService implements PaymentSystemService {
  private paywayMap: Map<PaymentDirection, PaymentDirectionRestriction> = new Map<PaymentDirection, PaymentDirectionRestriction>();

  private secret: string;
  private shopId: string;
  private account: string;
  private apiId: string;

  constructor(
    private httpService: HttpService,
    private keyValueService: SettingsService,
  ) {
    this.secret = configService.getPayeerConfig().secret;
    this.shopId = configService.getPayeerConfig().shopId;
    this.account = configService.getPayeerConfig().account;
    this.apiId = configService.getPayeerConfig().apiId;

    this.paywayMap.set(PaymentDirection.QIWI, new PaymentDirectionRestriction('26808', false, true));
    this.paywayMap.set(PaymentDirection.YANDEX_MONEY, new PaymentDirectionRestriction('57378077', false, true));
    this.paywayMap.set(PaymentDirection.VISA_RU, new PaymentDirectionRestriction('117146509', false, true));
    this.paywayMap.set(PaymentDirection.VISA_UA, new PaymentDirectionRestriction('117146509', false, true));
    this.paywayMap.set(PaymentDirection.WEBMONEY, new PaymentDirectionRestriction('webmoney_usd', false, false));
    this.paywayMap.set(PaymentDirection.BEELINE, new PaymentDirectionRestriction('24898938', false, true));
    this.paywayMap.set(PaymentDirection.MEGAFON, new PaymentDirectionRestriction('24899391', false, true));
    this.paywayMap.set(PaymentDirection.TELE2, new PaymentDirectionRestriction('95877310', false, true));
    this.paywayMap.set(PaymentDirection.MTS, new PaymentDirectionRestriction('24899291', false, true));
  }

  /*
    private getWebsiteUrl(): Promise<string> {
      return this.keyValueService.getValue(KVKeys.ACTIVE_WEBSITE_URL);
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
  */

  private isPhone(direction: PaymentDirection): boolean {
    return [PaymentDirection.BEELINE, PaymentDirection.MEGAFON, PaymentDirection.TELE2, PaymentDirection.MTS].includes(direction);
  }


  private sign(account: string, currency: string, description: string, sum: number): string {
    const str = [account, currency, description, sum, this.secret].join('{up}');
    return crypto.createHash('sha256').update(str).digest('hex');
  }


  public async getIncomeUrl(moneyIncome: MoneyIncome, ip: string, userParams: any, manager: EntityManager): Promise<PaymentFormView> {
    const description = 'Пополнение баланса';
    const params = {
      account: this.account,
      apiId: this.apiId,
      apiPass: this.secret,
      action: 'invoiceCreate',
      m_shop: this.shopId,
      m_orderid: moneyIncome.id,
      m_amount: moneyIncome.sum,
      m_curr: 'RUB',
      m_desc: description,
    };


    const response = (await this.httpService.post(`https://payeer.com/ajax/api/api.php?invoiceCreate`, encodeURI(Object.keys(params).map(key => key + '=' + params[key]).join('&')), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).toPromise()).data;
    if (!response.success) {
      const message = 'Системная ошибка';
      throw new Error(message);
    }

    return new PaymentFormView(
      response.url,
      'GET',
      {},
    );
  }

  async transferMoney(moneyOutcome: MoneyOutcome): Promise<void> {
    const params = {
      account: this.account,
      apiId: this.apiId,
      apiPass: this.secret,
      action: 'payout',
      ps: this.paywayMap.get(moneyOutcome.direction).code,
      sumIn: moneyOutcome.sum - moneyOutcome.startBalance - moneyOutcome.commission,
      curIn: 'RUB',
      curOut: 'RUB',
      param_ACCOUNT_NUMBER: moneyOutcome.params.account,
      referenceId: moneyOutcome.id,
    };

    const response = (await this.httpService.post(`https://payeer.com/ajax/api/api.php?payout`, Object.keys(params).map(key => key + '=' + params[key]).join('&')).toPromise()).data;
    if (!response.success) {
      const message = 'Системная ошибка';
      throw new Error(message);
    }
  }

  async getIncomePaymentDirections(): Promise<PaymentDirectionDetails[]> {
    const incomeCommissionPercents = +(await this.keyValueService.get(PAYMENT.PAYMENT_INCOME_COMMISSION));
    const outcomeCommissionPercents = +(await this.keyValueService.get(PAYMENT.PAYMENT_OUTCOME_COMMISSION));

    return [new PaymentDirectionDetails(
      PaymentDirection.PAYEER,
      1,
      incomeCommissionPercents,
      outcomeCommissionPercents,
      0,
    )];
  }


  async getOutcomePaymentDirections(): Promise<PaymentDirectionDetails[]> {
    const incomeCommissionPercents = +(await this.keyValueService.get(PAYMENT.PAYMENT_INCOME_COMMISSION));
    const outcomeCommissionPercents = +(await this.keyValueService.get(PAYMENT.PAYMENT_OUTCOME_COMMISSION));


    return Array.from(this.paywayMap.entries())
      .filter(restr => restr[1].outcome)
      .map(restr => new PaymentDirectionDetails(
        restr[0],
        [PaymentDirection.VISA_RU, PaymentDirection.VISA_UA].includes(restr[0]) ? 300 : 1,
        incomeCommissionPercents,
        outcomeCommissionPercents,
        [PaymentDirection.VISA_RU, PaymentDirection.VISA_UA].includes(restr[0]) ? 50 : 0,
      ));
  }

}