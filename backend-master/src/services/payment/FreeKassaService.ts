import { PaymentSystemService } from './PaymentSystemService';
import { MoneyIncome } from '../../models/payment/income.entity';
import { MoneyOutcome } from '../../models/payment/outcome.entity';
import {
  PaymentDirection,
  PaymentDirectionDetails,
  PaymentDirectionRestriction,
  PaymentFormView,
  PaymentSystemType,
} from './PaymentService';
import { HttpService, Injectable } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { PAYMENT } from '../../constants/settings';
import { configService } from '../../config/config.service';
import * as crypto from 'crypto';
import { EntityManager } from 'typeorm';

@Injectable()
export class FreeKassaService implements PaymentSystemService {
  private paywayMap: Map<
    PaymentDirection,
    PaymentDirectionRestriction
  > = new Map<PaymentDirection, PaymentDirectionRestriction>();

  private secret1: string;
  private secret2: string;
  private shopId: string;

  constructor(
    private httpService: HttpService,
    private keyValueService: SettingsService,
  ) {
    this.secret1 = configService.getFreeKassaConfig().secret1;
    this.secret2 = configService.getFreeKassaConfig().secret2;
    this.shopId = configService.getFreeKassaConfig().shopId;

    this.paywayMap.set(
      PaymentDirection.FREEKASSA,
      new PaymentDirectionRestriction('133', true, true),
    );

    this.paywayMap.set(
      PaymentDirection.QIWI,
      new PaymentDirectionRestriction('63', false, true),
    );
    this.paywayMap.set(
      PaymentDirection.YANDEX_MONEY,
      new PaymentDirectionRestriction('45', false, true),
    );
    this.paywayMap.set(
      PaymentDirection.VISA_RU,
      new PaymentDirectionRestriction('94', false, true),
    );
    this.paywayMap.set(
      PaymentDirection.VISA_UA,
      new PaymentDirectionRestriction('67', false, true),
    );
    this.paywayMap.set(
      PaymentDirection.BEELINE,
      new PaymentDirectionRestriction('83', false, true),
    );
    this.paywayMap.set(
      PaymentDirection.MEGAFON,
      new PaymentDirectionRestriction('82', false, true),
    );
    this.paywayMap.set(
      PaymentDirection.TELE2,
      new PaymentDirectionRestriction('132', false, true),
    );
    this.paywayMap.set(
      PaymentDirection.MTS,
      new PaymentDirectionRestriction('84', false, true),
    );
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
    return [
      PaymentDirection.BEELINE,
      PaymentDirection.MEGAFON,
      PaymentDirection.TELE2,
      PaymentDirection.MTS,
    ].includes(direction);
  }

  private sign(
    shopId: string,
    sum: number,
    secret: string,
    orderId: number,
  ): string {
    const str = [shopId, sum, secret, orderId].join(':');
    return crypto.createHash('md5').update(str).digest('hex');
  }

  public async isOrderCompleted(orderId: number): Promise<boolean> {
    const hash = crypto
      .createHash('md5')
      .update(this.shopId + this.secret2)
      .digest('hex');

    console.log(`https://free-kassa.ru/api.php?merchant_id=${this.shopId}&s=${hash}&action=check_order_status&order_id=${orderId}&type=json`);
    const response: any = (
      await this.httpService
        .get(
          `https://free-kassa.ru/api.php?merchant_id=${this.shopId}&s=${hash}&action=check_order_status&order_id=${orderId}&type=json`,
        )
        .toPromise()
    ).data;
    return response.data.status === 'completed';
  }

  public async getIncomeUrl(
    moneyIncome: MoneyIncome,
    ip: string,
    userParams: any,
    manager: EntityManager,
  ): Promise<PaymentFormView> {
    const params = {
      m: this.shopId,
      oa: moneyIncome.sum,
      o: moneyIncome.id,
      s: this.sign(this.shopId, moneyIncome.sum, this.secret1, moneyIncome.id),
    };

    return new PaymentFormView(
      `https://www.free-kassa.ru/merchant/cash.php`,
      'GET',
      params,
    );
  }

  async transferMoney(moneyOutcome: MoneyOutcome): Promise<void> {
    return new Promise((resolve) => resolve());
  }

  async getIncomePaymentDirections(): Promise<PaymentDirectionDetails[]> {
    const incomeCommissionPercents = +(await this.keyValueService.get(
      PAYMENT.PAYMENT_INCOME_COMMISSION,
    ));
    const outcomeCommissionPercents = +(await this.keyValueService.get(
      PAYMENT.PAYMENT_INCOME_COMMISSION,
    ));

    return [
      new PaymentDirectionDetails(
        PaymentDirection.FREEKASSA,
        PaymentSystemType.FREEKASSA,
        1,
        incomeCommissionPercents,
        outcomeCommissionPercents,
      ),
    ];
  }

  async getOutcomePaymentDirections(): Promise<PaymentDirectionDetails[]> {
    const incomeCommissionPercents = +(await this.keyValueService.get(
      PAYMENT.PAYMENT_INCOME_COMMISSION,
    ));
    const outcomeCommissionPercents = +(await this.keyValueService.get(
      PAYMENT.PAYMENT_INCOME_COMMISSION,
    ));

    return Array.from(this.paywayMap.entries())
      .filter((restr) => restr[1].outcome)
      .map(
        (restr) =>
          new PaymentDirectionDetails(
            restr[0],
            [PaymentDirection.VISA_RU, PaymentDirection.VISA_UA].includes(restr[0]) ? 300 : 1,
            incomeCommissionPercents,
            outcomeCommissionPercents,
            [PaymentDirection.VISA_RU, PaymentDirection.VISA_UA].includes(restr[0]) ? 50 : 0,
          ),
      );
  }
}
