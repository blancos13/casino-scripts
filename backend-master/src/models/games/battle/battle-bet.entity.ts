import { BattleGame } from './battle.entity';
import { UserBet } from '../../user/user-bet.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Index } from 'typeorm/index';

@Entity({name: 'battle_game_bet'})
@Index('battle_game_bet_game_user_idx', ['battle', 'userId'])
export class BattleGameBet {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: false })
  public userId: number;

  @Column({nullable: false})
  public chance: number;

  @Column({nullable: false})
  public amount: number;

  @ManyToOne(() => BattleGame, game => game.bets, {nullable: true, cascade: false, eager: true})
  public battle: BattleGame;

  @OneToOne(() => UserBet, { nullable: false, cascade: true, eager: true })
  @JoinColumn({ name: 'user_bet_id' })
  public bet: UserBet;
}