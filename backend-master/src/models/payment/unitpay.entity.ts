import { Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { MoneyIncome } from './income.entity';

@Entity({ name: 'unitpay_income' })
export class UnitpayIncome {
  @PrimaryColumn()
  public id: number;

  @OneToOne(() => MoneyIncome, { nullable: false, eager: true })
  @JoinColumn({ name: 'income_id' })
  public income: MoneyIncome;
}