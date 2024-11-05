import { JackpotGameBet } from './jackpot-bet.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  EntityManager
} from 'typeorm';


@Entity({name: 'jackpot_game'})
export class JackpotGame {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: true })
  public date: Date;

  @Column({nullable: true})
  public winUserId: number;

  public async bets(manager: EntityManager): Promise<JackpotGameBet[]> {
    return manager.find(JackpotGameBet, {battle: this})
  }
}