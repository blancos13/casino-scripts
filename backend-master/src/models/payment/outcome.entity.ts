import { User } from './../user/user.entity';
import { Column, Entity, JoinColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { PaymentDirection } from '../../services/payment/PaymentService'

enum MoneyOutcomeStatus {
  WAIT,
  SUCCESS,
  REJECT
}

@Entity({name: 'money_outcome'})
class MoneyOutcome {
  @PrimaryGeneratedColumn()
  public id: number;
  @Column({nullable: false, name: 'sum', type: 'float'})
  public _sum: number;
  @Column({nullable: false})
  public date: Date;
  @Column({nullable: false})
  public status: MoneyOutcomeStatus;
  @Column({nullable: false})
  public direction: PaymentDirection;
  @Column({nullable: false, name: 'params', default: '{}'})
  private _params: string;
  @ManyToOne(() => User, {nullable: false, eager: true})
  @JoinColumn({name: 'user_id'})
  public user: User;
  @Column({nullable: false, name: 'commission', type: 'float'})
  private _commission: number;
  @Column({nullable: false, name: 'start_balance', type: 'float'})
  private _startBalance: number;

  get params(): any {
    return JSON.parse(this._params);
  }

  set params(value: any) {
    this._params = JSON.stringify(value);
  }


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

  get startBalance(): number {
    return this._startBalance;
  }

  set startBalance(value: number) {
    this._startBalance = value ? +value.toFixed(2) : value;
  }
}

export {MoneyOutcomeStatus, MoneyOutcome}