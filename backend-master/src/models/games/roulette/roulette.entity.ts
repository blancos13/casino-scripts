import { RouletteGameBet, RouletteBetType } from './roulette-bet.entity';
import { Column, Entity, EntityManager, PrimaryGeneratedColumn } from 'typeorm';


@Entity({name: 'roulette_game'})
export class RouletteGame {
  @PrimaryGeneratedColumn()
  public id: number;
  @Column({ nullable: true })
  public date: Date;
  @Column({nullable: true})
  public winSide: RouletteBetType;

  public async grayBets(manager: EntityManager) : Promise<RouletteGameBet[]> {
    return manager.find(RouletteGameBet, {grayRouletteGame : this})
  }

  public async redBets(manager: EntityManager) : Promise<RouletteGameBet[]> {
    return manager.find(RouletteGameBet, {redRouletteGame : this})
  }

  public async greenBets(manager: EntityManager) : Promise<RouletteGameBet[]> {
    return manager.find(RouletteGameBet, {greenRouletteGame : this})
  }
}