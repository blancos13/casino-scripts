import { UserBet } from './../../user/user-bet.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RouletteGame } from './roulette.entity';
import { Index } from 'typeorm/index';

enum RouletteBetType {
  RED,
  GREEN,
  GRAY
}

@Entity({name: 'roulette_game_bet'})
@Index('roulette_game_bet_game_user_idx',['redRouletteGame', 'greenRouletteGame', 'grayRouletteGame', 'userId'])
class RouletteGameBet {
  @PrimaryGeneratedColumn()
  public id: number;
  @Column({nullable: false})
  public userId: number;
  @Column({nullable: false})
  public betType: RouletteBetType;

  @ManyToOne(() => RouletteGame, game => game.redBets, {nullable: true, cascade: false, eager: true})
  public redRouletteGame: RouletteGame;
  @ManyToOne(() => RouletteGame, game => game.greenBets, {nullable: true, cascade: false, eager: true})
  public greenRouletteGame: RouletteGame;
  @ManyToOne(() => RouletteGame, game => game.grayBets, {nullable: true, cascade: false, eager: true})
  public grayRouletteGame: RouletteGame;

  @OneToOne(() =>UserBet, {nullable: false, cascade: true, eager: true})
  @JoinColumn({name: 'user_bet_id'})
  public bet: UserBet;
}

export { RouletteBetType, RouletteGameBet }