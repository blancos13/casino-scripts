import { BadRequestException, Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { PAYMENT } from './../../constants/settings';
import { UserService } from './../user/user.service';
import { User } from './../../models/user/user.entity';
import { SettingsService } from './../settings/settings.service';
import { PaymentSystemService } from './PaymentSystemService';
import { PiastrixService } from './PiastrixService';
import { UnitpayService } from './UnitpayService';
import { PayeerService } from './PayeerService';
import { MoneyOutcome, MoneyOutcomeStatus } from '../../models/payment/outcome.entity';
import { MoneyIncome, MoneyIncomeStatus } from '../../models/payment/income.entity';
import { FreeKassaService } from './FreeKassaService';

class PaymentDirectionRestriction {
  constructor(
    public code: string,
    public income: boolean,
    public outcome: boolean
  ) {}
}

class PaymentFormView {
  constructor(
    public url: string,
    public method: string,
    public params: any,
  ) {
  }
}

enum PaymentDirection {
  QIWI,
  YANDEX_MONEY,
  VISA_RU,
  VISA_UA,
  WEBMONEY,
  BEELINE,
  MEGAFON,
  TELE2,
  MTS,
  SBER_ONLINE,
  PAYEER,
  FREEKASSA,
}

class PaymentDirectionDetails {
  constructor(
    public direction: PaymentDirection,
    public minOutcomeSum: number,
    public incomeCommissionPercents: number,
    public outcomeCommissionPercents: number,
    public outcomeCommissionAdditionalSum: number
  ) {
  }
}

enum PaymentSystemType {
  FREEKASSA,
  PIASTRIX,
  UNITPAY,
  PAYEER,
}

class PaymentPageSettings {
  constructor(
    public incomeDirections: PaymentDirectionDetails[],
    public outcomeDirections: PaymentDirectionDetails[],
    public startBalanceMinus: number
  ) {
  }
}

@Injectable()
class PaymentService {
  private paymentServiceMap: Map<PaymentSystemType, PaymentSystemService> = new Map<PaymentSystemType, PaymentSystemService>();

  constructor(
    private keyValueService: SettingsService,
    private piastrixService: PiastrixService,
    private unitpayService: UnitpayService,
    private payeerService: PayeerService,
    private freeKassaService: FreeKassaService,
    private userService: UserService,
    private connection: Connection
  ) {
    this.paymentServiceMap.set(PaymentSystemType.FREEKASSA, freeKassaService);
    this.paymentServiceMap.set(PaymentSystemType.PAYEER, payeerService);
    this.paymentServiceMap.set(PaymentSystemType.PIASTRIX, piastrixService);
    this.paymentServiceMap.set(PaymentSystemType.UNITPAY, unitpayService);
  }

  public async getPageInfo(user: User): Promise<PaymentPageSettings> {
    const startBalance = +(await this.keyValueService.get(PAYMENT.START_BALANCE));
    const outcomes = await this.connection.manager.count(MoneyOutcome, {
      user: user,
      status: MoneyOutcomeStatus.SUCCESS,
    });

    const service = await this.getActivePaymentService();
    return new PaymentPageSettings(
      await service.getIncomePaymentDirections(),
      await service.getOutcomePaymentDirections(),
      outcomes === 0 ? startBalance : 0
    );
  }


  public async getIncomeUrl(sum: number, direction: PaymentDirection, params: any, user: User): Promise<PaymentFormView> {
    const commissionPercents: number = +(await this.keyValueService.get(PAYMENT.PAYMENT_INCOME_COMMISSION));

    if(sum <= 0) {
      throw new BadRequestException('Сумма пополнения должна быть больше 0')
    }

    try {
      const commission = sum * commissionPercents / 100;
      return await this.connection.transaction(async manager => {
        const moneyIncome = new MoneyIncome();
        moneyIncome.user = user;
        moneyIncome.sum = sum;
        moneyIncome.commission = commission;
        moneyIncome.direction = direction;
        moneyIncome.date = new Date();
        moneyIncome.status = MoneyIncomeStatus.WAIT;
        return (await this.getActivePaymentService()).getIncomeUrl(await manager.save(moneyIncome), user.ip, params, manager);
      });
    } catch (e) {
      console.log(e);
      throw new BadRequestException('Перепроверьте данные')
    }
  }

  public async acceptIncome(incomeId: number): Promise<void> {
    const income = await this.connection.manager.findOne(MoneyIncome, { id: incomeId });
    if([MoneyIncomeStatus.REJECT, MoneyIncomeStatus.SUCCESS].includes(income.status)) {
      throw new Error('Платеж уже обработан')
    }
    await this.connection.transaction(async manager => {
      const moneyIncome = await manager.findOne(MoneyIncome, { id: incomeId });
      moneyIncome.status = MoneyIncomeStatus.SUCCESS;
      await manager.save(moneyIncome);
      await this.userService.changeBalance({ balance: moneyIncome.sum, id: moneyIncome.user.id }, manager, 'Пополнение');
    });
  }

  public async rejectIncome(incomeId: number): Promise<void> {
    const income = await this.connection.manager.findOne(MoneyIncome, { id: incomeId });
    if([MoneyIncomeStatus.REJECT, MoneyIncomeStatus.SUCCESS].includes(income.status)) {
      throw new Error('Платеж уже обработан')
    }
    await this.connection.transaction(async manager => {
      const moneyIncome = await manager.findOne(MoneyIncome, { id: incomeId });
      moneyIncome.status = MoneyIncomeStatus.REJECT;
      await manager.save(moneyIncome);
    });
  }

  public async registerOutcomeRequest(sum: number, params: any, direction: PaymentDirection, user: User): Promise<MoneyOutcome> {

    let minSum = +(await this.keyValueService.get(PAYMENT.PAYMENT_OUTCOME_MIN_SUM));

    minSum = Math.max((await (await this.getActivePaymentService()).getOutcomePaymentDirections()).find(details => details.direction === direction).minOutcomeSum, minSum);
    if(sum < minSum) {
      throw new BadRequestException(`Минимальная сумма вывода ${minSum}`)
    }
    const outcomeInfo: PaymentPageSettings = await this.getPageInfo(user);

    const directionDetails = outcomeInfo.outcomeDirections.find(details => details.direction === direction);
    const commissionPercents: number = directionDetails.outcomeCommissionPercents;
    const startBalance: number = outcomeInfo.startBalanceMinus;
    const commission = sum * commissionPercents / 100 + directionDetails.outcomeCommissionAdditionalSum;

    const withCommissionsSum = sum + commission + startBalance;

    const moneyOutcome = await this.connection.transaction(async manager => {
      const balanceData = (await manager.query(`select balance from public."user" where id = ${user.id} for update`))[0];
      const balance = +balanceData.balance;

      if (balance < withCommissionsSum) {
        throw new BadRequestException('Недостаточно средств на балансе');
      }

      await this.userService.changeBalance({ balance: -withCommissionsSum, id: user.id }, manager, 'Регистрация вывода');
      const moneyIncome = new MoneyOutcome();
      moneyIncome.user = user;
      moneyIncome.sum = sum;
      moneyIncome.commission = commission;
      moneyIncome.startBalance = startBalance;
      moneyIncome.direction = direction;
      moneyIncome.date = new Date();
      moneyIncome.status = MoneyOutcomeStatus.WAIT;
      moneyIncome.params = params;

      return manager.save(moneyIncome);
    });

    return moneyOutcome;
  }


  public async acceptOutcome(outcomeId: number): Promise<void> {
    await this.connection.transaction(async manager => {
      const moneyOutcome = await manager.findOne(MoneyOutcome, { id: outcomeId });
      moneyOutcome.status = MoneyOutcomeStatus.SUCCESS;
      await (await this.getActivePaymentService()).transferMoney(await manager.save(moneyOutcome));
    });
  }

  public async rejectOutcome(outcomeId: number): Promise<void> {
    await this.connection.transaction(async manager => {
      const moneyOutcome = await manager.findOne(MoneyOutcome, { id: outcomeId });
      moneyOutcome.status = MoneyOutcomeStatus.REJECT;
      await manager.save(moneyOutcome);
      await this.userService.changeBalance({ balance: moneyOutcome.sum + moneyOutcome.commission + moneyOutcome.startBalance, id: moneyOutcome.user.id }, manager, 'Отклонение вывода');
    });
  }


  public async getOutcomes(): Promise<MoneyOutcome[]> {
    const manyRows: MoneyOutcome[] = await this.connection.createQueryBuilder(MoneyOutcome, 'outcome')
      .addOrderBy('outcome.date', 'DESC')
      .getMany();

    return Promise.all(manyRows.map(async row => this.connection.manager.findOne(MoneyOutcome, { id: row.id })));
  }

  public async getUserOutcomes(user: User): Promise<MoneyOutcome[]> {
    const manyRows: MoneyOutcome[] = await this.connection.createQueryBuilder(MoneyOutcome, 'outcome')
      .where('outcome.user_id = :userId', { userId: user.id })
      .addOrderBy('outcome.date', 'DESC')
      .getMany();

    return Promise.all(manyRows.map(async row => this.connection.manager.findOne(MoneyOutcome, { id: row.id })));
  }

  public async getIncomes(): Promise<MoneyIncome[]> {
    const manyRows: MoneyIncome[] = await this.connection.createQueryBuilder(MoneyIncome, 'income')
      .addOrderBy('income.date', 'DESC')
      .getMany();

    return Promise.all(manyRows.map(async row => this.connection.manager.findOne(MoneyIncome, { id: row.id })));
  }

  public async getUserIncomes(user: User): Promise<MoneyIncome[]> {
    const manyRows: MoneyIncome[] = await this.connection.createQueryBuilder(MoneyIncome, 'income')
      .where('income.user_id = :userId', { userId: user.id })
      .addOrderBy('income.date', 'DESC')
      .getMany();

    return Promise.all(manyRows.map(async row => this.connection.manager.findOne(MoneyIncome, { id: row.id })));
  }


  private async getActivePaymentService(): Promise<PaymentSystemService> {
    return this.paymentServiceMap.get(+(await this.keyValueService.get(PAYMENT.ACTIVE_PAYMENT_SYSTEM)));
  }
}

export { PaymentDirection, PaymentService, PaymentFormView, PaymentDirectionDetails, PaymentDirectionRestriction, PaymentPageSettings, PaymentSystemType};
