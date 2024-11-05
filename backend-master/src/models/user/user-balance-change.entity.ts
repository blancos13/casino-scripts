import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { JoinColumn, ManyToOne } from 'typeorm/index';
import { User } from './user.entity';

export enum TypeUpPayment {
  BALANCE,
  DEMO_BALANCE
}

@Entity({
  name: 'user_balance_change',
})
export class UserBalanceChange {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => User, {nullable: false, eager: true})
  @JoinColumn({name: 'user_id'})
  public user: User;

  @Column({ nullable: false })
  public type: TypeUpPayment

  @Column({name: 'old_balance',type: 'float', nullable: false})
  private _oldBalance: number;

  @Column({name: 'new_balance',type: 'float', nullable: false})
  private _newBalance: number;

  @Column({nullable: false,type: 'float'})
  public change: number;

  @Column({nullable: false})
  public description: string

  @Column({name: 'date', nullable: false})
  public date: Date;

  get oldBalance(): number {
    return +this._oldBalance.toFixed(2);
  }

  set oldBalance(value: number) {
    this._oldBalance = value ? +value.toFixed(2) : value;
  }

  get newBalance(): number {
    return +this._newBalance.toFixed(2);
  }

  set newBalance(value: number) {
    this._newBalance = value ? +value.toFixed(2) : value;
  }
}