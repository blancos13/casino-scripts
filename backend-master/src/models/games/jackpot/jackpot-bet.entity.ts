import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Index } from 'typeorm/index';

import { JackpotGame } from './jackpot.entity';
import { UserBet } from '../../user/user-bet.entity';

@Entity({name: 'jackpot_game_bet'})
@Index('jackpot_game_bet_game_user_idx',['userId'])
export class JackpotGameBet {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public userId: number;

  @Column({nullable: false})
  public chance: number;

  @Column({nullable: false})
  public amount: number;

  @ManyToOne(() => JackpotGame, game => game.bets, {nullable: true, cascade: false, eager: true})
  public battle: JackpotGame;

  @OneToOne(() => UserBet, { nullable: false, cascade: true, eager: true })
  @JoinColumn({ name: 'user_bet_id' })
  public bet: UserBet;
}