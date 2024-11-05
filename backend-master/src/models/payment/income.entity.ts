import { User } from './../user/user.entity';
import { Column, Entity, JoinColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { PaymentDirection } from '../../services/payment/PaymentService'

enum MoneyIncomeStatus {
  WAIT,
  SUCCESS,
  REJECT
}


@Entity({name: 'money_income'})
class MoneyIncome {
  @PrimaryGeneratedColumn()
  public id: number;
  @Column({nullable: false, name: 'sum', type: 'float'})
  private _sum: number;
  @Column({nullable: false})
  public date: Date;
  @Column({nullable: false})
  public status: MoneyIncomeStatus;
  @Column({nullable: false})
  public direction: PaymentDirection;
  @ManyToOne(() => User, {nullable: false, eager: true})
  @JoinColumn({name: 'user_id'})
  public user: User;
  @Column({nullable: false, name: 'commission', type: 'float'})
  public _commission: number;


  get sum(): number {
    return this._sum;
  }

  set sum(value: number) {
    this._sum = value ? +value.toFixed(2) : value;
  }

  get commission(): number {
    return this._commission;
  }

  set commission(value: number) {
    this._commission = value ? +value.toFixed(2) : value;
  }
}

export {MoneyIncome, MoneyIncomeStatus };