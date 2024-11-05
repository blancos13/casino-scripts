import { MoneyOutcome } from 'src/models/payment/outcome.entity';
import { MoneyIncome } from 'src/models/payment/income.entity';
import { PAYMENT } from './../../constants/settings';
import { SettingsService } from './../settings/settings.service';
import { configService } from './../../config/config.service';
import { PaymentSystemService } from './PaymentSystemService';
import { HttpService, Injectable } from '@nestjs/common';
import {
  PaymentDirection,
  PaymentDirectionDetails,
  PaymentDirectionRestriction,
  PaymentFormView,
} from './PaymentService';
import * as crypto from 'crypto';
import { EntityManager } from 'typeorm';

@Injectable()
export class PiastrixService implements PaymentSystemService {
  private secret: string;
  private shopId: string;

  private paywayMap: Map<PaymentDirection, PaymentDirectionRestriction> = new Map<PaymentDirection, PaymentDirectionRestriction>();


  constructor(
    private httpService: HttpService,
    private keyValueService: SettingsService,
  ) {
    this.secret = configService.getPiastrix().secret;
    this.shopId = configService.getPiastrix().shopId;

    this.paywayMap.set(PaymentDirection.QIWI, new PaymentDirectionRestriction('qiwi_rub', true, true));
    this.paywayMap.set(PaymentDirection.YANDEX_MONEY, new PaymentDirectionRestriction('yamoney_rub',true, true));
    this.paywayMap.set(PaymentDirection.VISA_RU, new PaymentDirectionRestriction('card_rub',true,true));
    this.paywayMap.set(PaymentDirection.VISA_UA, new PaymentDirectionRestriction('card_uah',false,true));
    this.paywayMap.set(PaymentDirection.WEBMONEY, new PaymentDirectionRestriction('webmoney_usd',false,true));
    this.paywayMap.set(PaymentDirection.BEELINE, new PaymentDirectionRestriction('beeline_rub',true,true));
    this.paywayMap.set(PaymentDirection.MEGAFON, new PaymentDirectionRestriction('megafon_rub',true,true));
    this.paywayMap.set(PaymentDirection.TELE2, new PaymentDirectionRestriction('tele2_rub',true,true));
    this.paywayMap.set(PaymentDirection.MTS, new PaymentDirectionRestriction('mts_rub',true,true));
  }


  private getPaymentUrl(): Promise<string> {
    return this.keyValueService.get(PAYMENT.ACTIVE_BANK_CALLBACK_URL);
  }

  private sign(params: any) {
    const values = Object.keys(params).map(key => params[key]).filter(key => !!key);

    const hash = crypto.createHash('sha256').update(values.join(':') + this.secret).digest('hex');
    params.sign = hash;
  }

  public async getIncomeUrl(moneyIncome: MoneyIncome, ip: string,userParams: any, manager: EntityManager): Promise<PaymentFormView> {
    const params = {
      amount: (moneyIncome.sum + moneyIncome.commission).toFixed(2),
      currency: '643',
      payway: this.paywayMap.get(moneyIncome.direction).code,
      shop_id: this.shopId,
      shop_order_id: moneyIncome.id,
      sign: null,
      failed_url: null,
      success_url: null,
      callback_url: null,
      callback_rejected_url: null,
    };

    this.sign(params);

    for(const key in userParams) {
      params[key] = userParams[key];
    }

    params.failed_url = new URL('/api/redirect/payment/fail', await this.getPaymentUrl());
    params.success_url = new URL('/api/redirect/payment/success', await this.getPaymentUrl());
    params.callback_url = new URL('/api/payment/piastrix', await this.getPaymentUrl());
    params.callback_rejected_url = new URL('/api/payment/piastrix', await this.getPaymentUrl());

    try {
      const response = (await this.httpService.post('https://core.piastrix.com/invoice/create', params).toPromise()).data;
      if(!response.result) {
        throw new Error(response.message);
      }

      return new PaymentFormView(
        response.data.url,
        response.data.method,
        response.data.data
      );
    } catch (e) {
      throw e;
    }
  }

  public async transferMoney(moneyOutcome: MoneyOutcome): Promise<void> {
    const params = {
      account: moneyOutcome.params.account,
      amount: moneyOutcome.sum,
      amount_type: 'ps_amount',
      payway: this.paywayMap.get(moneyOutcome.direction).code,
      shop_currency: '643',
      shop_id: this.shopId,
      shop_payment_id: moneyOutcome.id,
      sign: null
    };

    this.sign(params);

    try {
      const response = (await this.httpService.post('https://core.piastrix.com/withdraw/create', params).toPromise()).data;
      if(!response.result) {
        throw new Error(response.message);
      }
    } catch (e) {
      throw e;
    }
  }

  async getIncomePaymentDirections(): Promise<PaymentDirectionDetails[]> {
    const incomeCommissionPercents = +(await this.keyValueService.get(PAYMENT.PAYMENT_INCOME_COMMISSION));
    const outcomeCommissionPercents = +(await this.keyValueService.get(PAYMENT.PAYMENT_OUTCOME_COMMISSION));

    return Array.from(this.paywayMap.entries())
      .filter(restr => restr[1].income)
      .map(restr => new PaymentDirectionDetails(
        restr[0],
        [PaymentDirection.VISA_RU, PaymentDirection.VISA_UA].includes(restr[0]) ? 300 : 1,
        incomeCommissionPercents,
        outcomeCommissionPercents,
        [PaymentDirection.VISA_RU, PaymentDirection.VISA_UA].includes(restr[0]) ? 50 : 0
      ))
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
        [PaymentDirection.VISA_RU, PaymentDirection.VISA_UA].includes(restr[0]) ? 50 : 0
      ))
  }

}