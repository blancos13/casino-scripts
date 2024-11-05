import { CreateHiloInterface } from './interfaces/create-hilo.interface';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";

import { GameStatusEnum } from './enum/game-status.enum';

import { User } from '../user/user.entity'

@Entity({
  name: 'hilo_game'
})
export class Hilo {
  @PrimaryGeneratedColumn()
  public id: number

  @Column({ nullable: false, type: 'float4' })
  public bet: number

  @Column({ nullable: true, type: 'float4' })
  public win: number

  @Column({ nullable: false, default: new Date() })
  public date: Date

  @ManyToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'user_id' })
  public user: User

  @Column({ nullable: false })
  public status: GameStatusEnum

  @Column({ nullable: false, type: 'float4' })
  public cell1: number
  @Column({ nullable: false, type: 'float4' })
  public cell2: number
  @Column({ nullable: false, type: 'float4' })
  public cell3: number

  @Column({ nullable: true, type: 'float4' })
  public mul: number

  constructor(data: CreateHiloInterface) {
    if (data) {
      this.bet = data.wager
      this.win = data.amount
      this.user = data.user
      this.status = data.status
      this.cell1 = data.cell1
      this.cell2 = data.cell2
      this.cell3 = data.cell3
      this.date = new Date()
    }
  }
}
