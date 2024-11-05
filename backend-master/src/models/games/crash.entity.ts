import { CrashGameBet } from './crash-bet.entity';
import { Entity, PrimaryGeneratedColumn, Column, EntityManager } from "typeorm";
import { GameStatusEnum } from './enum/game-status.enum';

@Entity({
  name: 'crash_game'
})
export class Crash {
  @PrimaryGeneratedColumn()
  public id: number

  @Column({ nullable: true, type: 'float4' })
  public bet: number

  @Column({ nullable: true, type: 'float4' })
  public win: number

  @Column({ nullable: true, type: 'float4' })
  public winBetId: number

  @Column({ nullable: true, default: new Date() })
  public date: Date

  @Column({ nullable: true })
  public status: GameStatusEnum

  @Column({ nullable: true, type: 'float4' })
  public cell1: number
  @Column({ nullable: true, type: 'float4' })
  public cell2: number
  @Column({ nullable: true, type: 'float4' })
  public cell3: number

  @Column({ nullable: true, type: 'float4' })
  public mul: number

  @Column({ nullable: true, name: 'server_seed' })
  public serverSeed: string

  @Column({ nullable: true, name: 'user_id' })
  public userId: number

  public async bets(manager: EntityManager) : Promise<CrashGameBet[]> {
    return manager.find(CrashGameBet, {game : this})
  }
}
