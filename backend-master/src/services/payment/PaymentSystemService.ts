import { MoneyIncome } from 'src/models/payment/income.entity';
import { MoneyOutcome } from 'src/models/payment/outcome.entity';
import { PaymentDirectionDetails, PaymentFormView } from './PaymentService';
import { EntityManager } from 'typeorm';

export interface PaymentSystemService {
  getIncomeUrl(moneyIncome: MoneyIncome, ip: string, params: any, manager: EntityManager) : Promise<PaymentFormView>;
  transferMoney(moneyOutcome: MoneyOutcome) : Promise<void>;
  getIncomePaymentDirections() : Promise<PaymentDirectionDetails[]>
  getOutcomePaymentDirections() : Promise<PaymentDirectionDetails[]>
}