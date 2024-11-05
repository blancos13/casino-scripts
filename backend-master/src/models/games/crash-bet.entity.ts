import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { UserBet } from '../user/user-bet.entity';
import { Crash } from './crash.entity'

@Entity({
  name: 'crash_game_bet'
})
export class CrashGameBet {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public userId: number;

  @Column({ nullable: false, name: 'auto_pay' })
  public autoPay: number;

  @Column({ nullable: false })
  public amount: number;

  @ManyToOne(() => Crash, game => game.bets, { nullable: true, cascade: false, eager: true })
  public game: Crash;

  @OneToOne(() => UserBet, { nullable: false, cascade: true, eager: true })
  @JoinColumn({ name: 'user_bet_id' })
  public bet: UserBet;
}