import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";

import { GameStatusEnum } from './enum/game-status.enum';

import { User } from '../user/user.entity'

import { CreateMinesInterface } from './interfaces/create-mines.interface';

@Entity({
  name: 'mines_game'
})
export class Mines {
  @PrimaryGeneratedColumn()
  public id: number

  @Column({ nullable: false, type: 'float4' })
  public bet: number

  @Column({ nullable: true, type: 'float4' })
  public win: number

  @Column({ nullable: true, type: 'float4' })
  public coefficient: number

  @Column({ nullable: true })
  public selected: string

  @Column({ nullable: false, default: new Date() })
  public date: Date

  @ManyToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'user_id' })
  public user: User

  @Column({ nullable: false })
  public status: GameStatusEnum

  @Column({ nullable: false })
  public cell1: string
  @Column({ nullable: false })
  public cell2: string
  @Column({ nullable: false })
  public cell3: string
  @Column({ nullable: false })
  public cell4: string

  constructor(data: CreateMinesInterface) {
    if (data) {
      this.bet = data.wager
      this.win = data.amount
      this.user = data.user
      this.status = data.status
      this.selected = data.selected
      this.cell1 = data.cell1
      this.cell2 = data.cell2
      this.cell3 = data.cell3
      this.cell4 = data.cell4
      this.date = new Date()
    }
  }
}
