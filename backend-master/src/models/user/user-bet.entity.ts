import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Index } from 'typeorm/index';

import { GameTypeEnum } from '../../constants/game-type.enum'; 

@Entity({ name: 'user_bet' })
@Index('user_bet_game_user_date_idx',['game','userId', 'date'])
@Index('user_bet_game_user_idx',['game','userId'])
@Index('user_bet_game_idx',['game'])
export class UserBet {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public game: GameTypeEnum;

  @Column({ nullable: false })
  public userId: number;

  @Column({ nullable: true, name: 'game_finished' })
  public gameFinished: boolean;

  @Column({ nullable: false })
  public date: Date;
  
  @Column({ nullable: false, type: 'float', name: 'bet' })
  private _bet: number;
  @Column({ nullable: true, type: 'float', name: 'chance' })
  private _chance: number;
  @Column({ nullable: true, type: 'float', name: 'prize' })
  private _prize: number;
  @Column({nullable: true, name: 'commission', type: 'float'})
  public _commission: number;

  set chance(val: number) {
    this._chance = val ? +val.toFixed(2) : val;
  }

  get chance() : number {
    return this._chance;
  }

  get bet(): number {
    return this._bet;
  }

  set bet(value: number) {
    this._bet = value ? +value.toFixed(2) : value;
  }

  get prize(): number {
    return this._prize;
  }

  set prize(value: number) {
    this._prize = value ? +value.toFixed(2) : value;
  }

  get commission(): number {
    return this._commission;
  }

  set commission(value: number) {
    this._commission = value ? +value.toFixed(2) : value;
  }
}