import { BattleGameBet } from './battle-bet.entity';
import { Column, Entity, PrimaryGeneratedColumn, EntityManager } from 'typeorm';

@Entity({name: 'battle_game'})
export class BattleGame {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ nullable: true })
  public date: Date;

  @Column({nullable: true})
  public winUserId: number;

  public async bets(manager: EntityManager): Promise<BattleGameBet[]> {
    return manager.find(BattleGameBet, {battle: this})
  }
}